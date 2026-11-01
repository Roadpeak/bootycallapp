// lib/utils/compress-image.ts

/**
 * Shrinks a photo before upload and returns base64 JPEG data (no data: prefix).
 *
 * Phone photos are 3-8MB each; sent as-is, a few of them made signups fail
 * with a vague server error. 1600px on the long side at 82% quality keeps
 * them sharp on screen at a few hundred KB.
 */
export async function compressImageToBase64(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error(`"${file.name}" is not a photo. Use JPG or PNG images.`)
    }
    const url = URL.createObjectURL(file)
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject(new Error(`We couldn't read "${file.name}". Try a JPG or PNG photo instead.`))
            image.src = url
        })
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Your browser could not prepare the photo. Try another browser.')
        ctx.fillStyle = '#fff' // transparent PNGs become white, not black
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', quality).split(',')[1]
    } finally {
        URL.revokeObjectURL(url)
    }
}

export function compressImagesToBase64(files: File[]): Promise<string[]> {
    return Promise.all(files.map((f) => compressImageToBase64(f)))
}
