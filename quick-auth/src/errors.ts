export type GlobalErrorType<name extends string = 'Error'> = Error & {
  name: name
}

export class BaseError<
  cause extends Error | undefined = undefined,
> extends Error {
  details: string
  shortMessage: string

  override cause: cause
  override name = 'BaseError'

  constructor(shortMessage: string, options: BaseError.Options<cause> = {}) {
    const details = (() => {
      if (options.cause instanceof BaseError) {
        if (options.cause.details) return options.cause.details
        if (options.cause.shortMessage) return options.cause.shortMessage
      }
      if (
        options.cause &&
        'details' in options.cause &&
        typeof options.cause.details === 'string'
      )
        return options.cause.details
      if (options.cause?.message) return options.cause.message
      return options.details!
    })()

    const message = [
      shortMessage || 'An error occurred.',
      ...(options.metaMessages ? ['', ...options.metaMessages] : []),
      ...(details
        ? [
          '',
          details ? `Details: ${details}` : undefined,
        ]
        : []),
    ]
      .filter((x) => typeof x === 'string')
      .join('\n')

    super(message, options.cause ? { cause: options.cause } : undefined)

    this.cause = options.cause as any
    this.details = details
    this.shortMessage = shortMessage
  }
}

export declare namespace BaseError {
  type Options<cause extends Error | undefined = Error | undefined> = {
    cause?: cause | undefined
    details?: string | undefined
    metaMessages?: (string | undefined)[] | undefined
  }
}

export class ResponseError extends BaseError {
  override readonly name = 'RequestFailedError'

  constructor({ status }: { status: number }) {
    super(`Request failed with status ${status}`)
  }
}

export class InvalidSiwfError extends BaseError {
  override readonly name = 'InvalidToken'

  constructor(message: string) {
    super(message)
  }
}

export class InvalidTokenError extends BaseError {
  override readonly name = 'InvalidToken'

  constructor(message: string) {
    super(message)
  }
}

export class InvalidParametersError extends BaseError {
  override readonly name = 'InvalidParameters'

  constructor(message: string) {
    super(message)
  }
}
