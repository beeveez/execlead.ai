import React, { useEffect } from 'react';
import { DEFAULT_SOCIAL_IMAGE, getPublicMetadata } from '@/lib/publicMetadata';

const HOME_METADATA = getPublicMetadata('/');
const DEFAULT_TITLE = HOME_METADATA.title;
const DEFAULT_DESCRIPTION = HOME_METADATA.description;
const DEFAULT_IMAGE = DEFAULT_SOCIAL_IMAGE;

function setMeta(selector, attribute, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    if (selector.includes('rel="canonical"')) tag.setAttribute('rel', 'canonical');
    const name = selector.match(/name="([^"]+)"/)?.[1];
    const property = selector.match(/property="([^"]+)"/)?.[1];
    if (name) tag.setAttribute('name', name);
    if (property) tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
}

export default function PageMetadata({ title, description, path, image = DEFAULT_IMAGE, indexable = true }) {
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
    setMeta('meta[name="robots"]', 'content', indexable ? 'index, follow' : 'noindex, nofollow, noarchive');
    if (indexable) setMeta('link[rel="canonical"]', 'href', pageUrl);
    else document.head.querySelector('link[rel="canonical"]')?.remove();
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
      setMeta('meta[name="robots"]', 'content', 'index, follow');
      setMeta('link[rel="canonical"]', 'href', 'https://execleadai.co/');
    };
  }, [description, image, indexable, path, title]);
  return null;
}