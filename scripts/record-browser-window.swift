import AppKit
import AVFoundation
import CoreGraphics
import Foundation
import ScreenCaptureKit

private struct WindowInfo: Encodable {
    struct Frame: Encodable {
        let x: Double
        let y: Double
        let width: Double
        let height: Double
    }

    let windowID: UInt32
    let title: String
    let app: String
    let frame: Frame
}

private final class RecordingDelegate: NSObject, SCRecordingOutputDelegate {
    private let lock = NSLock()
    private var started = false
    private var finished = false
    private var error: Error?
    private var startWaiters: [CheckedContinuation<Void, Error>] = []
    private var finishWaiters: [CheckedContinuation<Void, Error>] = []

    func recordingOutputDidStartRecording(_ recordingOutput: SCRecordingOutput) {
        lock.lock()
        started = true
        let waiters = startWaiters
        startWaiters.removeAll()
        lock.unlock()
        var standardError = StandardError()
        print("READY", to: &standardError)
        for waiter in waiters { waiter.resume() }
    }

    func recordingOutputDidFinishRecording(_ recordingOutput: SCRecordingOutput) {
        lock.lock()
        finished = true
        let waiters = finishWaiters
        finishWaiters.removeAll()
        lock.unlock()
        for waiter in waiters { waiter.resume() }
    }

    func recordingOutput(_ recordingOutput: SCRecordingOutput, didFailWithError error: Error) {
        lock.lock()
        self.error = error
        let startWaiters = startWaiters
        let finishWaiters = finishWaiters
        self.startWaiters.removeAll()
        self.finishWaiters.removeAll()
        lock.unlock()
        for waiter in startWaiters { waiter.resume(throwing: error) }
        for waiter in finishWaiters { waiter.resume(throwing: error) }
    }

    func waitForStart() async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            lock.lock()
            if let error {
                lock.unlock()
                continuation.resume(throwing: error)
            } else if started {
                lock.unlock()
                continuation.resume()
            } else {
                startWaiters.append(continuation)
                lock.unlock()
            }
        }
    }

    func waitForFinish() async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            lock.lock()
            if let error {
                lock.unlock()
                continuation.resume(throwing: error)
            } else if finished {
                lock.unlock()
                continuation.resume()
            } else {
                finishWaiters.append(continuation)
                lock.unlock()
            }
        }
    }
}

private struct StandardError: TextOutputStream {
    mutating func write(_ string: String) {
        FileHandle.standardError.write(string.data(using: .utf8)!)
    }
}

private func listWindows() async throws {
    let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
    let windows = content.windows.map { window in
        WindowInfo(
            windowID: window.windowID,
            title: window.title ?? "",
            app: window.owningApplication?.applicationName ?? "",
            frame: .init(
                x: window.frame.origin.x,
                y: window.frame.origin.y,
                width: window.frame.size.width,
                height: window.frame.size.height
            )
        )
    }
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    print(String(decoding: try encoder.encode(windows), as: UTF8.self))
}

private func record(arguments: [String]) async throws {
    guard arguments.count == 7,
          let windowID = UInt32(arguments[0]),
          let cropX = Double(arguments[2]),
          let cropY = Double(arguments[3]),
          let cropW = Double(arguments[4]),
          let cropH = Double(arguments[5]),
          cropW > 0, cropH > 0,
          let seconds = Double(arguments[6]), seconds > 0 else {
        throw NSError(domain: "record-browser-window", code: 64, userInfo: [NSLocalizedDescriptionKey: "Usage: record-browser-window <windowID> <output.mp4> <cropX> <cropY> <cropW> <cropH> <seconds>"])
    }

    let outputURL = URL(fileURLWithPath: arguments[1])
    guard outputURL.pathExtension.lowercased() == "mp4" else {
        throw NSError(domain: "record-browser-window", code: 64, userInfo: [NSLocalizedDescriptionKey: "Output must end in .mp4"])
    }

    let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
    guard let window = content.windows.first(where: { $0.windowID == windowID }) else {
        throw NSError(domain: "record-browser-window", code: 66, userInfo: [NSLocalizedDescriptionKey: "Window \(windowID) was not found"])
    }

    let filter = SCContentFilter(desktopIndependentWindow: window)
    let streamConfiguration = SCStreamConfiguration()
    streamConfiguration.width = 1080
    streamConfiguration.height = 750
    // Sample above the display refresh rate to avoid missing frames at interval boundaries.
    streamConfiguration.minimumFrameInterval = CMTime(value: 1, timescale: 120)
    streamConfiguration.sourceRect = CGRect(x: cropX, y: cropY, width: cropW, height: cropH)
    streamConfiguration.colorSpaceName = CGColorSpace.sRGB
    streamConfiguration.colorMatrix = CGDisplayStream.yCbCrMatrix_ITU_R_709_2
    streamConfiguration.capturesAudio = false
    streamConfiguration.showsCursor = false
    if #available(macOS 14.0, *) {
        streamConfiguration.ignoreShadowsSingleWindow = true
    }

    let delegate = RecordingDelegate()
    let recordingConfiguration = SCRecordingOutputConfiguration()
    recordingConfiguration.outputURL = outputURL
    recordingConfiguration.videoCodecType = .h264
    recordingConfiguration.outputFileType = .mp4
    let recordingOutput = SCRecordingOutput(configuration: recordingConfiguration, delegate: delegate)
    let stream = SCStream(filter: filter, configuration: streamConfiguration, delegate: nil)
    try stream.addRecordingOutput(recordingOutput)
    try await stream.startCapture()
    try await delegate.waitForStart()
    try await Task.sleep(for: .seconds(seconds))
    try await stream.stopCapture()
    try await delegate.waitForFinish()
    var standardError = StandardError()
    print("STATS duration=\(CMTimeGetSeconds(recordingOutput.recordedDuration)) bytes=\(recordingOutput.recordedFileSize)", to: &standardError)
}

@main
private struct Recorder {
    static func main() async {
        do {
            NSApplication.shared.setActivationPolicy(.accessory)
            let arguments = Array(CommandLine.arguments.dropFirst())
            if arguments.isEmpty {
                try await listWindows()
            } else {
                try await record(arguments: arguments)
            }
        } catch {
            FileHandle.standardError.write(("ERROR: \(error.localizedDescription)\n").data(using: .utf8)!)
            Foundation.exit(1)
        }
    }
}
