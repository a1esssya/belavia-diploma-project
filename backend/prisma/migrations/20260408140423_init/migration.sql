-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('UPCOMING', 'PAST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('QUOTED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'EXPIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ITINERARY', 'ETICKET', 'RECEIPT', 'EXCHANGE_CONFIRMATION', 'REFUND_CONFIRMATION');

-- CreateEnum
CREATE TYPE "PssScenario" AS ENUM ('FLEXIBLE', 'EXCHANGE_SURCHARGE', 'REFUND_BLOCKED', 'CANCELLED_TRIP', 'PAST_TRIP', 'QUOTE_EXPIRED', 'COMMIT_FAILURE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_order_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_order_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders_showcase" (
    "id" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "passengerFirstName" TEXT NOT NULL,
    "passengerLastName" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "arrivalAt" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pssScenario" "PssScenario" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_showcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_documents" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "deliveryEmail" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_operations" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pssQuoteId" TEXT NOT NULL,
    "quoteAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "changeFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fareDifference" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "status" "OperationStatus" NOT NULL DEFAULT 'QUOTED',
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_operations" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pssQuoteId" TEXT NOT NULL,
    "quoteAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "refundFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "OperationStatus" NOT NULL DEFAULT 'QUOTED',
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "responseRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_accessToken_key" ON "sessions"("accessToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_order_links_userId_orderId_key" ON "user_order_links"("userId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_showcase_pnr_key" ON "orders_showcase"("pnr");

-- CreateIndex
CREATE UNIQUE INDEX "orders_showcase_ticketNumber_key" ON "orders_showcase"("ticketNumber");

-- CreateIndex
CREATE INDEX "order_documents_orderId_idx" ON "order_documents"("orderId");

-- CreateIndex
CREATE INDEX "order_events_orderId_createdAt_idx" ON "order_events"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_operations_pssQuoteId_key" ON "exchange_operations"("pssQuoteId");

-- CreateIndex
CREATE INDEX "exchange_operations_orderId_idx" ON "exchange_operations"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_operations_pssQuoteId_key" ON "refund_operations"("pssQuoteId");

-- CreateIndex
CREATE INDEX "refund_operations_orderId_idx" ON "refund_operations"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order_links" ADD CONSTRAINT "user_order_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order_links" ADD CONSTRAINT "user_order_links_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders_showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_documents" ADD CONSTRAINT "order_documents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders_showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders_showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_operations" ADD CONSTRAINT "exchange_operations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders_showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_operations" ADD CONSTRAINT "refund_operations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders_showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
