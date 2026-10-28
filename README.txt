Put project pictures here, then point to them from js/content.js.

The picture frame on a project's left page is optional. It shows only when a project has media,
and the media can be an image or a live website:

  DETAILS['work-3'] = {
    cover: 'images/cradlewave-cover.jpg',        // opening image (or use embed: 'https://...' for a website)
    panels: [
      { h: 'Prototype 1', p: ['...'], img: 'images/cradlewave-prototype.jpg', alt: 'The first prototype during testing' },
      { h: 'Final build', p: ['...'], embed: 'https://your-site.example' }
    ]
  };

Images show in black and white at rest and in colour while someone reads (hovers over or taps) the matching
section on the right. A section with no picture keeps the one above it; a project with none hides the frame.
Some websites refuse to be embedded; the frame always includes an "Open the site" link as a fallback.
