import React, { useEffect } from 'react';

const DEFAULT_TITLE = 'EXECLEAD.AI | AI Executive Leadership Operating System™';
const DEFAULT_DESCRIPTION = 'EXECLEAD.AI helps ambitious professionals become executive-ready leaders through AI-powered executive readiness assessments, personalized coaching, leadership simulations, executive intelligence, and evidence-based leadership development.';
const DEFAULT_IMAGE = 'https://media.base44.com/images/public/6a4a2bd8dcadcf2160c0a05d/c8da542d1_image.png?v=3.0';

function setMeta(selector, attribute, value) {
  const tag = document.head.querySelector(selector);
  if (tag) tag.setAttribute(attribute, value);
}

export default function PageMetadata({ title, description, path, image = DEFAULT_IMAGE }) {
  useEffect(() => {
    const pageUrl = `https://execleadai.co${path}`;
    document.title = title;
    setMeta('meta[name="title"]', 'content', title);
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', pageUrl);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:url"]', 'content', pageUrl);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setMeta('link[rel="canonical"]', 'href', pageUrl);
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="title"]', 'content', DEFAULT_TITLE);
      setMeta('meta[name="description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:url"]', 'content', 'https://execleadai.co/');
      setMeta('meta[name="twitter:title"]', 'content', DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION);
      setMeta('meta[name="twitter:url"]', 'content', 'https://execleadai.co/');
      setMeta('link[rel="canonical"]', 'href', 'https://execleadai.co/');
    };
  }, [description, image, path, title]);
  return null;
}