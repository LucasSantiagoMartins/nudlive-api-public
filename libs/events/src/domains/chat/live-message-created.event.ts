export class LiveMessageCreatedEvent {
    constructor(
        public readonly id: string,
        public readonly liveId: string,
        public readonly userId: number,
        public readonly username: string,
        public readonly profilePhotoUrl: string,
        public readonly fullName: string,
        public readonly message: string,
        public readonly createdAt: Date,
    ) { }
}