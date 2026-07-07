export class UserUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly role?: string,
    public readonly fullName?: string,
    public readonly profilePhotoUrl?: string,
  ) {}
}