figma.showUI(__html__, { width: 380, height: 520 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    const { headline, subtext, bgColor, subtextColor, selectedImage } = msg;

    const frame = figma.currentPage.findOne(node =>
      node.type === 'FRAME' && node.name === '#template_1080x1350'
    );

    if (!frame) {
      figma.notify("❌ Couldn't find the template frame.");
      return;
    }

    const headlineNode = frame.findOne(n => n.name === '#headline_text' && n.type === 'TEXT');
    const subtextNode = frame.findOne(n => n.name === '#sub_text' && n.type === 'TEXT');
    const backgroundNode = frame.findOne(n => n.name === '#background_color' && n.type === 'RECTANGLE');
    const imageNode = frame.findOne(n => n.name === '#main_image' && n.type === 'RECTANGLE');

    if (!headlineNode || !subtextNode || !backgroundNode) {
      figma.notify("❌ Required elements are missing.");
      return;
    }

    await figma.loadFontAsync(headlineNode.fontName);
    await figma.loadFontAsync(subtextNode.fontName);

    // Headline
    headlineNode.characters = headline;
    headlineNode.textAutoResize = 'HEIGHT';
    headlineNode.resizeWithoutConstraints(frame.width - 80, headlineNode.height);
    headlineNode.fontSize = 160;

    while (headlineNode.height > 220 && headlineNode.fontSize > 60) {
      headlineNode.fontSize -= 2;
    }

    // Subtext
    subtextNode.characters = subtext;
    subtextNode.fontSize = 48;
    subtextNode.fills = [{ type: 'SOLID', color: hexToRgb(subtextColor) }];
    subtextNode.textAlignHorizontal = 'CENTER';

    // Background
    backgroundNode.fills = [{ type: 'SOLID', color: hexToRgb(bgColor) }];

    // Image
    if (imageNode && selectedImage) {
      try {
        const img = await fetchImage(selectedImage);
        imageNode.fills = [{
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: img.hash,
        }];
      } catch (err) {
        figma.notify('⚠️ Failed to load image');
      }
    }

    figma.notify('✅ Post updated!');
  }
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

async function fetchImage(fileName) {
  const response = await fetch(`images/${fileName}`);
  const buffer = await response.arrayBuffer();
  return figma.createImage(new Uint8Array(buffer));
}
