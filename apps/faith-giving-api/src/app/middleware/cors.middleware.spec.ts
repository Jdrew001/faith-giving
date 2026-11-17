import { BadRequestException } from '@nestjs/common';
import { CorsMiddleware } from './cors.middleware';

describe('production browser requests', () => {
  const trusted = 'https://discoverfaitharlington.org';
  const response = () => ({ setHeader: jest.fn() });
  it('accepts the giving page’s same-origin GET without an Origin header', () => {
    const next = jest.fn();
    new CorsMiddleware().use({ headers: { referer: `${trusted}/give/` } }, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });
  it('keeps accepting the configured explicit Origin', () => {
    const next = jest.fn();
    new CorsMiddleware().use({ headers: { origin: trusted } }, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });
  it.each([
    { origin: 'https://foreign.example', referer: `${trusted}/give/` },
    { origin: 'null', referer: `${trusted}/give/` },
    { referer: `${trusted}.foreign.example/give/` },
    { referer: 'malformed' },
    {},
  ])('rejects foreign or unverifiable browser context: %j', headers => {
    const next = jest.fn();
    expect(() => new CorsMiddleware().use({ headers }, response(), next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });
});
