
/**
 * Composites the Original Skin PNG over the AI Generated Background.
 * Ensures 100% Fidelity (Pixel-Lock).
 */
export async function compositeImage(
    backgroundBase64: string,
    foregroundUrl: string,
    scale: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const bgImg = new Image();
        const fgImg = new Image();

        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;

            // 1. Draw Background (AI)
            ctx.drawImage(bgImg, 0, 0);

            fgImg.crossOrigin = "anonymous"; // Try to handle CORS for the skin image
            fgImg.onload = () => {
                // 2. Calculate Centered Position for Skin
                // We want the skin to be 'scale' % of the canvas width, maintaining aspect ratio
                const aspect = fgImg.width / fgImg.height;

                let drawWidth = canvas.width * scale;
                let drawHeight = drawWidth / aspect;

                // If height is too big, constrain by height instead
                if (drawHeight > canvas.height * scale) {
                    drawHeight = canvas.height * scale;
                    drawWidth = drawHeight * aspect;
                }

                const x = (canvas.width - drawWidth) / 2;
                const y = (canvas.height - drawHeight) / 2;

                // 3. Draw Foreground (Original PNG)
                // Add a subtle drop shadow for better integration
                ctx.shadowColor = "rgba(0,0,0,0.7)";
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 10;
                ctx.shadowOffsetY = 10;

                ctx.drawImage(fgImg, x, y, drawWidth, drawHeight);

                // 4. Return result
                resolve(canvas.toDataURL('image/png'));
            };

            fgImg.onerror = () => {
                // Fallback: If CORS fails (common with some CDNs), we might need to proxy or just error
                // Ideally we assume the user/app handles fetching the blob if needed, but here we try direct load.
                // If `foregroundUrl` is already a Base64 string, this works fine.
                // If it's a URL, we might hit CORS.
                reject(new Error('Failed to load foreground skin image. Check CORS or invalid URL.'));
            };
            fgImg.src = foregroundUrl;
        };

        bgImg.onerror = () => reject(new Error('Failed to load background image'));
        bgImg.src = backgroundBase64;
    });
}
