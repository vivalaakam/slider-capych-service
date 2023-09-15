import jimp from "jimp";

const FRAME_WIDTH = 100;
const FRAME_HEIGHT = 100;
const BORDER = 2;

export async function getImages(positionX: number, positionY: number): Promise<{ back: string, puzzle: string }> {
    const startX = 147 + positionX * 1.5;
    const startY = 70 + positionY * 2;

    // generate back image
    const back = await jimp.read("server/assets/puzzle.png");
    const backPuzzle = new jimp(FRAME_WIDTH, FRAME_HEIGHT, 'rgba(0,0,0,0.5)');
    back.composite(backPuzzle, startX - FRAME_WIDTH / 2, startY - FRAME_HEIGHT / 2);

    // generate slider image
    const sliderBack = await jimp.read("server/assets/puzzle.png");
    sliderBack.crop(startX + BORDER - FRAME_WIDTH / 2, startY + BORDER - FRAME_HEIGHT / 2, FRAME_WIDTH - BORDER * 2, FRAME_HEIGHT - BORDER * 2);

    const slider = new jimp(100, 400, 'transparent')
    slider.composite(backPuzzle, 0, startY - FRAME_WIDTH / 2);
    slider.composite(sliderBack, 0 + BORDER, startY + BORDER - FRAME_HEIGHT / 2);

    return {
        back: await back.getBase64Async(jimp.AUTO),
        puzzle: await slider.getBase64Async(jimp.AUTO)
    }
}
