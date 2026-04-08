import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    list(user: AuthenticatedUser, orderId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileName: string;
        url: string;
        deliveryEmail: string;
        lastSentAt: Date | null;
    }[]>;
    resend(user: AuthenticatedUser, orderId: string): Promise<{
        success: boolean;
        deliveryEmail: string;
        documents: {
            id: string;
            type: import(".prisma/client").$Enums.DocumentType;
            title: string;
            lastSentAt: Date | null;
        }[];
    }>;
}
