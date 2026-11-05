import { Module } from '@nestjs/common';

/**
 * Common/shared module for exporting cross-domain helpers (DTOs, transformers, constants).
 * Domain modules can import this for consistent types and utilities.
 */
@Module({})
export class SharedModule {}

