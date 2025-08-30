import { Lecture, Activity } from '../types/lecture';
import { Slide } from '../types/presentation';

export const parseContentToSlides = (lecture: Lecture, activities: Activity[]): Slide[] => {
    const slides: Slide[] = [];

    // Title slide
    slides.push({
        id: 'title',
        type: 'title',
        title: lecture.title,
        content: lecture.description
    });

    // Parse HTML content into slides
    const parser = new DOMParser();
    const doc = parser.parseFromString(lecture.content, 'text/html');

    // Split by headings (h1, h2, h3) to create slides
    const elements = Array.from(doc.body.children);
    let currentSlide: Slide | null = null;
    let slideCounter = 1;

    elements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();

        if (['h1', 'h2', 'h3'].includes(tagName)) {
            // Start a new slide
            if (currentSlide) {
                slides.push(currentSlide);
            }

            currentSlide = {
                id: `slide-${slideCounter++}`,
                type: 'content',
                title: element.textContent || '',
                content: ''
            };
        } else if (currentSlide) {
            // Add content to current slide
            if (element.tagName.toLowerCase() === 'img') {
                // Create separate image slide
                slides.push(currentSlide);
                slides.push({
                    id: `slide-${slideCounter++}`,
                    type: 'image',
                    title: element.getAttribute('alt') || 'Image',
                    image: element.getAttribute('src') || ''
                });
                currentSlide = null;
            } else {
                currentSlide.content += element.outerHTML;
            }
        } else {
            // Create a content slide if no heading was found
            currentSlide = {
                id: `slide-${slideCounter++}`,
                type: 'content',
                title: 'Content',
                content: element.outerHTML
            };
        }
    });

    // Add the last slide if it exists
    if (currentSlide) {
        slides.push(currentSlide);
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