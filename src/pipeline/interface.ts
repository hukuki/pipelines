interface CVBufferFile {
    content: Buffer,
    mimeType?: string,
    metadata?: object,
    version?: string,
    filename: string,
}

export { CVBufferFile }