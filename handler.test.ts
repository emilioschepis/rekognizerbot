import { extractHandles, extractUrls } from './handler';

test('setup works', () => {
  expect(1 + 1).toBe(2);
});

describe('URLs extraction', () => {
  it('should return no URLs for an empty input', () => {
    // Arrange
    const input = [];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(0);
  });

  it('should not contain plain text', () => {
    // Arrange
    const input = ['Plain text'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(0);
  });

  it('should detect URLs', () => {
    // Arrange
    const input = ['https://github.com/emilioschepis/rekognizerbot'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('https://github.com/emilioschepis/rekognizerbot');
  });

  it('should detect multiple URLs', () => {
    // Arrange
    const input = ['https://github.com/emilioschepis/rekognizerbot', 'https://github.com/'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(2);
    expect(output).toContain('https://github.com/emilioschepis/rekognizerbot');
    expect(output).toContain('https://github.com/');
  });

  it('should be case insensitive', () => {
    // Arrange
    const input = ['hTtPs://gItHuB.CoM/EmIlIoScHePiS/ReKoGnIzErBoT'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('https://github.com/emilioschepis/rekognizerbot');
  });

  it('should remove duplicates', () => {
    // Arrange
    const input = [
      'https://github.com/emilioschepis/rekognizerbot',
      'https://github.com/emilioschepis/rekognizerbot',
      'hTtPs://gItHuB.CoM/EmIlIoScHePiS/ReKoGnIzErBoT',
    ];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('https://github.com/emilioschepis/rekognizerbot');
  });

  it('should find URLs in plain text', () => {
    // Arrange
    const input = ['Plain https://github.com/ text'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('https://github.com/');
  });

  it('should find URL even if not clearly separated', () => {
    // Arrange
    const input = ['Plainhttps://github.com/ text'];

    // Act
    const output = extractUrls(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('https://github.com/');
  });
});

describe('handles extraction', () => {
  it('should return no handles for an empty input', () => {
    // Arrange
    const input = [];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(0);
  });

  it('should not contain plain text', () => {
    // Arrange
    const input = ['Plain text'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(0);
  });

  it('should detect handles', () => {
    // Arrange
    const input = ['@emilioschepis'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('@emilioschepis');
  });

  it('should detect multiple handles', () => {
    // Arrange
    const input = ['@emilioschepis', '@github'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(2);
    expect(output).toContain('@emilioschepis');
    expect(output).toContain('@github');
  });

  it('should be case insensitive', () => {
    // Arrange
    const input = ['@EmIlIoScHePiS'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('@emilioschepis');
  });

  it('should remove duplicates', () => {
    // Arrange
    const input = ['@emilioschepis', '@emilioschepis', '@EmIlIoScHePiS'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('@emilioschepis');
  });

  it('should find handles in plain text', () => {
    // Arrange
    const input = ['Plain @emilioschepis text'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(1);
    expect(output).toContain('@emilioschepis');
  });

  it('should only find handle if separated by spaces', () => {
    // Arrange
    const input = ['Plain@emilioschepis text'];

    // Act
    const output = extractHandles(input);

    // Assert
    expect(output).toHaveLength(0);
  });
});
