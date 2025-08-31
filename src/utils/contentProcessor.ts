// src/utils/contentProcessor.ts

/**
 * Processes lecture content for normal viewing mode
 * Handles slide markers and ensures proper HTML rendering
 */
export const processContentForViewing = (content: string): string => {
    if (!content) return '';

    // Replace slide markers with styled dividers
    return content
        .replace(/---SLIDE---/g, `
      <div class="slide-divider my-8 py-4 text-center">
        <div class="border-t-2 border-dashed border-blue-300 relative">
          <span class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 text-sm font-medium text-blue-700 rounded-full border border-blue-300">
            Slide Break
          </span>
        </div>
      </div>
    `)
        .trim();
};

/**
 * Checks if content has slide markers
 */
export const hasSlideMarkers = (content: string): boolean => {
    return content.includes('---SLIDE---');
};

/**
 * Gets the number of slides in content
 */
export const getSlideCount = (content: string): number => {
    if (!hasSlideMarkers(content)) return 1;
    return content.split('---SLIDE---').filter(slide => slide.trim().length > 0).length;
};

/**
 * Splits content into individual slides for presentation mode
 */
export const splitContentIntoSlides = (content: string): string[] => {
    if (!hasSlideMarkers(content)) return [content];

    return content
        .split('---SLIDE---')
        .map(slide => slide.trim())
        .filter(slide => slide.length > 0);
};