figma.showUI(__html__, { width: 300, height: 400 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'apply-template') {
    const { imageName, bgColor, subTextColor } = msg;

    // Find the template frame
    const template = figma.currentPage.findOne(node =>
      node.type === 'FRAME' && node.name === '#template_1080x1350'
    ) as FrameNode;

    if (!template) {
      figma.notify('❌ Template frame not found.');
      return;
    }

    // Update background color
    template.fills = [{ type: 'SOLID', color: hexToRgb(bgColor), opacity: 1 }];

    // Update subtext color
    const subText = template.findOne(node => node.name === 'Sub Text' && node.type === 'TEXT') as TextNode;
    if (subText) {
      await figma.loadFontAsync(subText.fontName as FontName);
      subText.fills = [{ type: 'SOLID', color: hexToRgb(subTextColor), opacity: 1 }];
    }

    // Add image from GitHub
    const imageUrl = `https://raw.githubusercontent.com/jtadiar/morph-designer-assets/main/images/${encodeURIComponent(imageName)}`;
    try {
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const image = figma.createImage(new Uint8Array(imageBytes));
      const imageNode = figma.createRectangle();
      imageNode.resize(500, 500); // Adjust size as needed
      imageNode.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash: image.hash }];
      imageNode.name = 'Morphy Image';
      imageNode.x = 290; // Position relative to your template
      imageNode.y = 350;
      template.appendChild(imageNode);
    } catch (err) {
      console.error('Image load error:', err);
      figma.notify('⚠️ Could not load image.');
    }

    figma.notify('✅ Template updated!');
    figma.closePlugin();
  }
};

// Utility to convert hex to RGB (0–1 scale)
function hexToRgb(hex: string): RGB {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  return { r, g, b };
}
