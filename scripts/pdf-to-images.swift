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
func has(_ name: String) -> Bool { args.contains("--\(name)") }

let inputs = args.enumerated()
    .filter { !$0.element.hasPrefix("--") && !(args.indices.contains($0.offset - 1) && args[$0.offset - 1].hasPrefix("--")) }
    .map(\.element)

guard let input = inputs.first else {
    print("""
    Uporaba: swift scripts/pdf-to-images.swift <datoteka.pdf> [možnosti]
      --name ime        začetek imena datotek
      --out mapa        kam (privzeto content/images)
      --px 2400         daljša stranica slike
      --format jpg|png  privzeto jpg
      --pages 1,3-5     katere strani
      --crop x,y,š,v    izrez v odstotkih strani, od zgoraj levo
      --join            izbrane strani sestavi v eno sliko, od leve proti desni
    """)
    exit(1)
}

let outDir = flag("out") ?? "content/images"
let maxPx = Double(flag("px") ?? "2400") ?? 2400
let format = (flag("format") ?? "jpg").lowercased()
let join = has("join")
let stem = URL(fileURLWithPath: input).deletingPathExtension().lastPathComponent
// A plain, url-safe stem, so a filename never depends on how the PDF was named.
let fallback = stem.lowercased()
    .folding(options: .diacriticInsensitive, locale: Locale(identifier: "en"))
    .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
    .trimmingCharacters(in: CharacterSet(charactersIn: "-"))
let name = flag("name") ?? (fallback.isEmpty ? "stran" : fallback)

/// `--crop 38,6,60,89` — left, top, width, height, in percent of the page.
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

/// What the page measures once its own rotation is applied.
func laidOut(_ page: CGPDFPage) -> CGSize {
    let box = page.getBoxRect(.cropBox)
    return abs(page.rotationAngle) % 180 == 90
        ? CGSize(width: box.height, height: box.width)
        : box.size
}

/// Draws pages side by side into one bitmap. A single page is just the case
/// where there is one of them; a spread is why this takes a list at all —
/// sections and site plans in a portfolio run across the fold.
func render(_ pages: [CGPDFPage]) -> CGImage? {
    let sizes = pages.map(laidOut)
    let totalW = sizes.reduce(0) { $0 + Double($1.width) }
    let totalH = sizes.map { Double($0.height) }.max() ?? 0
    guard totalW > 0, totalH > 0 else { return nil }

    // With a crop, the wanted piece — not the whole sheet — is what has to come
    // out at the asked-for size.
    let longest = crop.map { max(totalW * $0.w, totalH * $0.h) / 100 } ?? max(totalW, totalH)
    let scale = maxPx / longest
    // Each page gets a whole number of pixels and the next one starts a pixel
    // early. Landing a page edge inside a pixel leaves a white hairline down
    // the fold of a photograph that runs across the spread; the overlap is a
    // single pixel of continuous picture, which nothing can see.
    let columns = sizes.map { Int((Double($0.width) * scale).rounded()) }
    let width = columns.reduce(0, +) - (columns.count - 1)
    let height = Int((totalH * scale).rounded())

    guard let ctx = CGContext(
        data: nil, width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else { return nil }

    // PDFs have no background of their own; without this, a drawing lands on black.
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))

    var left = 0
    for (index, (page, size)) in zip(pages, sizes).enumerated() {
        ctx.saveGState()
        ctx.translateBy(x: Double(left), y: 0)
        ctx.scaleBy(x: scale, y: scale)
        // Pages hang from the top edge, so a short page never floats.
        ctx.translateBy(x: 0, y: totalH - Double(size.height))
        ctx.concatenate(page.getDrawingTransform(
            .cropBox,
            rect: CGRect(origin: .zero, size: size),
            rotate: 0,
            preserveAspectRatio: true
        ))
        ctx.drawPDFPage(page)
        ctx.restoreGState()
        left += columns[index] - 1
    }

    guard let full = ctx.makeImage() else { return nil }
    guard let c = crop else { return full }

    // Percentages are read off the rendered sheet, top-left down — the way it is
    // looked at — so the crop rect needs no flipping.
    let rect = CGRect(
        x: (c.x / 100 * Double(width)).rounded(),
        y: (c.y / 100 * Double(height)).rounded(),
        width: (c.w / 100 * Double(width)).rounded(),
        height: (c.h / 100 * Double(height)).rounded()
    ).intersection(CGRect(x: 0, y: 0, width: width, height: height))
    guard !rect.isEmpty else { return nil }
    return full.cropping(to: rect)
}

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

let type = format == "png" ? UTType.png : UTType.jpeg
let ext = format == "png" ? "png" : "jpg"

func write(_ image: CGImage, page: Int) -> Bool {
    let file = String(format: "%@-%02d.%@", name, page, ext)
    let out = URL(fileURLWithPath: outDir).appendingPathComponent(file)
    guard let dest = CGImageDestinationCreateWithURL(out as CFURL, type.identifier as CFString, 1, nil) else { return false }
    CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: 0.92] as CFDictionary)
    guard CGImageDestinationFinalize(dest) else { return false }

    let attrs = try? FileManager.default.attributesOfItem(atPath: out.path)
    let kb = ((attrs?[.size] as? Int) ?? 0) / 1024
    print("  \(file)  \(image.width)×\(image.height)  \(kb) kB")
    return true
}

var written = 0
if join {
    let pages = wanted.compactMap { doc.page(at: $0) }
    if let image = render(pages), let first = wanted.first, write(image, page: first) { written = 1 }
} else {
    for number in wanted {
        guard let page = doc.page(at: number), let image = render([page]) else { continue }
        if write(image, page: number) { written += 1 }
    }
}

print("\(written) \(written == 1 ? "slika" : "slik") → \(outDir)")
