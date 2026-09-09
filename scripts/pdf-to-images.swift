/**
 * Renders PDF pages — plans, drawings, scans — into web pictures.
 *
 * Written in Swift because macOS already has PDFKit and ImageIO: no poppler, no
 * ImageMagick, nothing to install on the machine this actually runs on.
 *
 *   swift scripts/pdf-to-images.swift nacrt.pdf --name hisa-nacrt
 *
 * Pages come out as hisa-nacrt-01.jpg … in content/images, ready for the
 * importer, which recognises pictures by filename.
 */
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = Array(CommandLine.arguments.dropFirst())

func flag(_ name: String) -> String? {
    guard let i = args.firstIndex(of: "--\(name)"), i + 1 < args.count else { return nil }
    return args[i + 1]
}

let inputs = args.enumerated()
    .filter { !$0.element.hasPrefix("--") && !(args.indices.contains($0.offset - 1) && args[$0.offset - 1].hasPrefix("--")) }
    .map(\.element)

guard let input = inputs.first else {
    print("Uporaba: swift scripts/pdf-to-images.swift <datoteka.pdf> [--name ime] [--out mapa] [--px 2400] [--format jpg|png] [--pages 1,3-5] [--crop x,y,s,v]")
    exit(1)
}

let outDir = flag("out") ?? "content/images"
let maxPx = Double(flag("px") ?? "2400") ?? 2400
let format = (flag("format") ?? "jpg").lowercased()
let stem = URL(fileURLWithPath: input).deletingPathExtension().lastPathComponent
// A plain, url-safe stem, so a filename never depends on how the PDF was named.
let fallback = stem.lowercased()
    .folding(options: .diacriticInsensitive, locale: Locale(identifier: "en"))
    .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
    .trimmingCharacters(in: CharacterSet(charactersIn: "-"))
let name = flag("name") ?? (fallback.isEmpty ? "stran" : fallback)

/// `--crop 38,6,60,89` — levo, zgoraj, širina, višina, v odstotkih strani.
/// Portfolio pages are layouts: the picture worth showing is usually one region
/// of the page, not the page with its captions and folio.
let crop: (x: Double, y: Double, w: Double, h: Double)? = {
    guard let spec = flag("crop") else { return nil }
    let n = spec.split(separator: ",").compactMap { Double($0.trimmingCharacters(in: .whitespaces)) }
    guard n.count == 4, n[2] > 0, n[3] > 0 else { return nil }
    return (n[0], n[1], n[2], n[3])
}()

let url = URL(fileURLWithPath: input)
guard let doc = CGPDFDocument(url as CFURL) else {
    FileHandle.standardError.write("Ne morem odpreti PDF: \(input)\n".data(using: .utf8)!)
    exit(1)
}

/// `--pages 1,3-5`; without it, every page.
let wanted: [Int] = {
    guard let spec = flag("pages") else { return Array(1...max(doc.numberOfPages, 1)) }
    var pages: [Int] = []
    for part in spec.split(separator: ",") {
        let bounds = part.split(separator: "-").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
        if bounds.count == 2, bounds[0] <= bounds[1] { pages.append(contentsOf: bounds[0]...bounds[1]) }
        else if let one = bounds.first { pages.append(one) }
    }
    return pages.filter { $0 >= 1 && $0 <= doc.numberOfPages }
}()

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

let type = format == "png" ? UTType.png : UTType.jpeg
let ext = format == "png" ? "png" : "jpg"
var written = 0

for page in wanted {
    guard let pdfPage = doc.page(at: page) else { continue }

    let box = pdfPage.getBoxRect(.cropBox)
    // A rotated page is taller than it is wide once drawn, so the canvas has to
    // swap sides before anything is measured against it.
    let rotated = abs(pdfPage.rotationAngle) % 180 == 90
    let size = rotated ? CGSize(width: box.height, height: box.width) : box.size
    guard size.width > 0, size.height > 0 else { continue }

    // With a crop, the wanted piece — not the whole page — is what has to come
    // out at the asked-for size.
    let longest: Double = crop.map { max(Double(size.width) * $0.w, Double(size.height) * $0.h) / 100 }
        ?? Double(max(size.width, size.height))
    let scale = maxPx / longest
    let width = Int((size.width * scale).rounded())
    let height = Int((size.height * scale).rounded())

    guard let ctx = CGContext(
        data: nil, width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else { continue }

    // PDFs have no background of their own; without this, a drawing lands on black.
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))

    ctx.scaleBy(x: scale, y: scale)
    ctx.concatenate(pdfPage.getDrawingTransform(
        .cropBox,
        rect: CGRect(origin: .zero, size: size),
        rotate: 0,
        preserveAspectRatio: true
    ))
    ctx.drawPDFPage(pdfPage)

    guard let full = ctx.makeImage() else { continue }

    // Percentages are read off the rendered page, top-left down — the way the
    // page is looked at — so the crop rect needs no flipping.
    var image = full
    if let c = crop {
        let rect = CGRect(
            x: (c.x / 100 * Double(width)).rounded(),
            y: (c.y / 100 * Double(height)).rounded(),
            width: (c.w / 100 * Double(width)).rounded(),
            height: (c.h / 100 * Double(height)).rounded()
        ).intersection(CGRect(x: 0, y: 0, width: width, height: height))
        guard !rect.isEmpty, let piece = full.cropping(to: rect) else { continue }
        image = piece
    }

    let file = String(format: "%@-%02d.%@", name, page, ext)
    let out = URL(fileURLWithPath: outDir).appendingPathComponent(file)
    guard let dest = CGImageDestinationCreateWithURL(out as CFURL, type.identifier as CFString, 1, nil) else { continue }
    CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: 0.92] as CFDictionary)
    guard CGImageDestinationFinalize(dest) else { continue }

    let attrs = try? FileManager.default.attributesOfItem(atPath: out.path)
    let kb = ((attrs?[.size] as? Int) ?? 0) / 1024
    print("  \(file)  \(image.width)×\(image.height)  \(kb) kB")
    written += 1
}

print("\(written) od \(doc.numberOfPages) strani → \(outDir)")
