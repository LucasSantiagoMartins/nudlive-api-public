export class UserCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly email: string | null,
    public readonly phoneNumber: string | null,
    public readonly role: string,
    public readonly fullName: string,
    public readonly profilePhotoUrl?: string | null,
  ) {}
}