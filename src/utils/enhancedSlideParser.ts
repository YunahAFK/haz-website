// src/utils/enhancedSlideParser.ts
import { Lecture, Activity } from '../types/lecture';
import { Slide } from '../types/presentation';

// Solution 1: Smart Content Chunking
export const parseContentToSlidesEnhanced = (lecture: Lecture, activities: Activity[]): Slide[] => {
    const slides: Slide[] = [];

    // Title slide
    slides.push({
        id: 'title',
        type: 'title',
        title: lecture.title,
        content: lecture.description
    });

    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(lecture.content, 'text/html');

    // Strategy 1: Split by headings (primary method)
    const headingSlides = splitByHeadings(doc);
    if (headingSlides.length > 1) {
        slides.push(...headingSlides);
    } else {
        // Strategy 2: Split by paragraphs/content blocks (fallback)
        const contentSlides = splitByContentBlocks(doc, lecture.content);
        slides.push(...contentSlides);
    }

    // Add activity slides
    activities.forEach((activity, index) => {
        slides.push({
            id: `activity-${index}`,
            type: 'activity',
            title: `Activity ${index + 1}`,
            activity
        });
    });

    return slides;
};

// Strategy 1: Split by headings (works when users use headings)
function splitByHeadings(doc: Document): Slide[] {
    const slides: Slide[] = [];
    const elements = Array.from(doc.body.children);
    let currentSlide: Slide | null = null;
    let slideCounter = 1;

    elements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            // Save previous slide
            if (currentSlide) {
                slides.push(currentSlide);
            }

            // Start new slide
            currentSlide = {
                id: `slide-${slideCounter++}`,
                type: 'content',
                title: element.textContent || `Slide ${slideCounter - 1}`,
                content: ''
            };
        } else if (currentSlide) {
            // Add content to current slide
            if (element.tagName.toLowerCase() === 'img') {
                // Save current slide and create image slide
                if (currentSlide.content && currentSlide.content.trim()) {
                    slides.push(currentSlide);
                }
                slides.push({
                    id: `slide-${slideCounter++}`,
                    type: 'image',
                    title: element.getAttribute('alt') || 'Image',
                    image: element.getAttribute('src') || ''
                });

                // Start new slide for content after image
                currentSlide = {
                    id: `slide-${slideCounter++}`,
                    type: 'content',
                    title: `Slide ${slideCounter - 1}`,
                    content: ''
                };
            } else {
                if (currentSlide.content !== undefined) {
                    currentSlide.content += element.outerHTML;
                } else {
                    currentSlide.content = element.outerHTML;
                }
            }
        }
    });

    // Add the last slide
    /*
    if (currentSlide && currentSlide.content && currentSlide.content.trim()) {
      slides.push(currentSlide);
    }
      */
    return slides;
}

// Strategy 2: Smart content chunking (fallback when no headings)
function splitByContentBlocks(doc: Document, rawContent: string): Slide[] {
    const slides: Slide[] = [];
    const elements = Array.from(doc.body.children);

    // Option A: Split by natural breaks (paragraphs, lists, etc.)
    const chunks = chunkByLogicalBreaks(elements);

    // Option B: Split by word/character count if chunks are too large
    const finalChunks = chunks.flatMap(chunk =>
        chunk.wordCount > 150 ? splitLargeChunk(chunk) : [chunk]
    );

    finalChunks.forEach((chunk, index) => {
        slides.push({
            id: `slide-${index + 1}`,
            type: 'content',
            title: chunk.title || `Slide ${index + 1}`,
            content: chunk.content
        });
    });

    return slides;
}

interface ContentChunk {
    content: string;
    title?: string;
    wordCount: number;
}

function chunkByLogicalBreaks(elements: Element[]): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    let currentChunk = '';
    let currentWordCount = 0;

    elements.forEach((element, index) => {
        const elementHTML = element.outerHTML;
        const elementText = element.textContent || '';
        const elementWordCount = elementText.split(/\s+/).length;

        // Check for natural breaking points
        const isBreakPoint =
            element.tagName.toLowerCase() === 'hr' ||
            element.tagName.toLowerCase() === 'blockquote' ||
            (element.tagName.toLowerCase() === 'p' && currentWordCount > 80) ||
            (element.tagName.toLowerCase() === 'ul' && currentWordCount > 60) ||
            (element.tagName.toLowerCase() === 'ol' && currentWordCount > 60);

        if (isBreakPoint && currentChunk.trim()) {
            // Save current chunk
            chunks.push({
                content: currentChunk,
                title: extractTitleFromContent(currentChunk),
                wordCount: currentWordCount
            });

            // Start new chunk
            currentChunk = elementHTML;
            currentWordCount = elementWordCount;
        } else {
            // Add to current chunk
            currentChunk += elementHTML;
            currentWordCount += elementWordCount;
        }

        // Force break if chunk gets too long
        if (currentWordCount > 200) {
            chunks.push({
                content: currentChunk,
                title: extractTitleFromContent(currentChunk),
                wordCount: currentWordCount
            });
            currentChunk = '';
            currentWordCount = 0;
        }
    });

    // Add final chunk
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk,
            title: extractTitleFromContent(currentChunk),
            wordCount: currentWordCount
        });
    }

    return chunks;
}

function splitLargeChunk(chunk: ContentChunk): ContentChunk[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(chunk.content, 'text/html');
    const elements = Array.from(doc.body.children);

    const subChunks: ContentChunk[] = [];
    let currentSubChunk = '';
    let currentWordCount = 0;

    elements.forEach((element) => {
        const elementHTML = element.outerHTML;
        const elementWordCount = (element.textContent || '').split(/\s+/).length;

        if (currentWordCount + elementWordCount > 100 && currentSubChunk.trim()) {
            subChunks.push({
                content: currentSubChunk,
                title: extractTitleFromContent(currentSubChunk),
                wordCount: currentWordCount
            });
            currentSubChunk = elementHTML;
            currentWordCount = elementWordCount;
        } else {
            currentSubChunk += elementHTML;
            currentWordCount += elementWordCount;
        }
    });

    if (currentSubChunk.trim()) {
        subChunks.push({
            content: currentSubChunk,
            title: extractTitleFromContent(currentSubChunk),
            wordCount: currentWordCount
        });
    }

    return subChunks;
}

function extractTitleFromContent(content: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Look for headings first
    const heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading?.textContent) {
        return heading.textContent.trim();
    }

    // Look for strong/bold text
    const strong = doc.querySelector('strong, b');
    if (strong?.textContent) {
        return strong.textContent.trim();
    }

    // Use first sentence
    const firstPara = doc.querySelector('p');
    if (firstPara?.textContent) {
        const firstSentence = firstPara.textContent.split('.')[0].trim();
        return firstSentence.length > 50
            ? firstSentence.substring(0, 50) + '...'
            : firstSentence;
    }

    return 'Content Slide';
}

// Solution 2: Manual Slide Breaks (Advanced)
export const parseContentWithManualBreaks = (content: string): Slide[] => {
    // Look for special markers that users can add
    const slideMarkers = [
        '---SLIDE---',
        '<!-- SLIDE -->',
        '[SLIDE]',
        '<hr class="slide-break">',
        '<div class="slide-break"></div>'
    ];

    let processedContent = content;

    // Replace all slide markers with a consistent delimiter
    slideMarkers.forEach(marker => {
        processedContent = processedContent.replace(
            new RegExp(marker, 'gi'),
            '||SLIDE_BREAK||'
        );
    });

    // Split by the delimiter
    const contentSlides = processedContent.split('||SLIDE_BREAK||');

    return contentSlides.map((slideContent, index) => ({
        id: `slide-${index + 1}`,
        type: 'content' as const,
        title: extractTitleFromContent(slideContent) || `Slide ${index + 1}`,
        content: slideContent.trim()
    })).filter(slide => slide.content.length > 0);
};

// Solution 3: AI-Powered Content Splitting (Conceptual)
export const parseContentWithAI = async (content: string): Promise<Slide[]> => {
    // This would integrate with an AI service to intelligently split content
    // For now, we'll simulate this with rule-based logic

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const slides: Slide[] = [];

    let currentSlideContent = '';
    let sentenceCount = 0;

    sentences.forEach((sentence, index) => {
        currentSlideContent += sentence.trim() + '. ';
        sentenceCount++;

        // Create slide every 3-5 sentences or when reaching a topic change
        const shouldBreak =
            sentenceCount >= 4 ||
            sentence.toLowerCase().includes('however') ||
            sentence.toLowerCase().includes('furthermore') ||
            sentence.toLowerCase().includes('in conclusion') ||
            sentence.toLowerCase().includes('next') ||
            sentence.toLowerCase().includes('moving on');

        if (shouldBreak || index === sentences.length - 1) {
            slides.push({
                id: `slide-${slides.length + 1}`,
                type: 'content',
                title: extractTitleFromContent(currentSlideContent),
                content: `<p>${currentSlideContent.trim()}</p>`
            });

            currentSlideContent = '';
            sentenceCount = 0;
        }
    });

    return slides;
};

// Solution 4: Configuration-based parsing
interface SlideConfig {
    maxWordsPerSlide: number;
    preferredBreakPoints: string[];
    minSlidesFromContent: number;
    maxSlidesFromContent: number;
}

export const parseContentWithConfig = (
    lecture: Lecture,
    activities: Activity[],
    config: SlideConfig
): Slide[] => {
    const slides: Slide[] = [];

    // Title slide
    slides.push({
        id: 'title',
        type: 'title',
        title: lecture.title,
        content: lecture.description
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(lecture.content, 'text/html');

    // Try different strategies based on config
    let contentSlides: Slide[] = [];

    // Strategy 1: Try heading-based splitting
    contentSlides = splitByHeadings(doc);

    // Strategy 2: If not enough slides, use content chunking
    if (contentSlides.length < config.minSlidesFromContent) {
        contentSlides = splitByContentBlocks(doc, lecture.content);
    }

    // Strategy 3: If too many slides, merge some
    if (contentSlides.length > config.maxSlidesFromContent) {
        contentSlides = mergeSmallSlides(contentSlides, config.maxSlidesFromContent);
    }

    slides.push(...contentSlides);

    // Add activities
    activities.forEach((activity, index) => {
        slides.push({
            id: `activity-${index}`,
            type: 'activity',
            title: `Activity ${index + 1}`,
            activity
        });
    });

    return slides;
};

function mergeSmallSlides(slides: Slide[], maxSlides: number): Slide[] {
    if (slides.length <= maxSlides) return slides;

    const merged: Slide[] = [];
    const targetSlidesPerGroup = Math.ceil(slides.length / maxSlides);

    for (let i = 0; i < slides.length; i += targetSlidesPerGroup) {
        const group = slides.slice(i, i + targetSlidesPerGroup);

        if (group.length === 1) {
            merged.push(group[0]);
        } else {
            merged.push({
                id: `merged-slide-${merged.length + 1}`,
                type: 'content',
                title: group[0].title || `Slide ${merged.length + 1}`,
                content: group.map(slide => slide.content || '').join('\n\n')
            });
        }
    }

    return merged;
}