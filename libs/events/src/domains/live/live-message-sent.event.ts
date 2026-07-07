export class LiveMessageSentEvent {
  constructor(
    public readonly liveId: string,
    public readonly userId: number,
    public readonly message: string,
  ) {}
}