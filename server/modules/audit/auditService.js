import { db } from "../../config/dbConfig.js";
import { auditLogs, users } from "../../db/Schema/schema.js";
import { eq, and, or, isNull, sql, desc, asc, ilike, count } from "drizzle-orm";
import { ApiError } from "../../utils/ApiError.js";

export const auditService = {
  getAuditLogs: async (query) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const {
      from,
      to,
      userId,
      moduleName,
      action,
      status,
      requestMethod,
      entityId,
      search,
      sortBy,
      order
    } = query;

    const filters = [];
    if (userId) filters.push(eq(auditLogs.userId, userId));
    if (moduleName) filters.push(eq(auditLogs.module, moduleName));
    if (action) filters.push(eq(auditLogs.action, action));
    if (status) filters.push(eq(auditLogs.status, status));
    if (requestMethod) filters.push(eq(auditLogs.requestMethod, requestMethod));
    if (entityId) filters.push(eq(auditLogs.entityId, entityId));

    if (from && from.trim() !== "") {
      filters.push(sql`date(${auditLogs.createdAt}) >= ${from}`);
    }
    if (to && to.trim() !== "") {
      filters.push(sql`date(${auditLogs.createdAt}) <= ${to}`);
    }

    if (search && search.trim() !== "") {
      const s = `%${search.trim()}%`;
      filters.push(or(
        ilike(auditLogs.description, s),
        ilike(auditLogs.module, s),
        ilike(auditLogs.action, s),
        ilike(users.email, s),
        ilike(users.fullName, s)
      ));
    }

    const conditions = and(...filters);

    const countResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions);
    const total = parseInt(countResult[0]?.count || 0, 10);
    const totalPages = Math.ceil(total / limit);

    const sortFieldMap = {
      createdAt: auditLogs.createdAt,
      action: auditLogs.action,
      module: auditLogs.module,
      status: auditLogs.status
    };
    const sortField = sortFieldMap[sortBy] || auditLogs.createdAt;
    const sortOrder = order?.toLowerCase() === "asc" ? asc(sortField) : desc(sortField);

    const data = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        module: auditLogs.module,
        entityId: auditLogs.entityId,
        entityName: auditLogs.entityName,
        oldData: auditLogs.oldData,
        newData: auditLogs.newData,
        description: auditLogs.description,
        ipAddress: auditLogs.ipAddress,
        browser: auditLogs.browser,
        operatingSystem: auditLogs.operatingSystem,
        deviceType: auditLogs.deviceType,
        requestMethod: auditLogs.requestMethod,
        requestUrl: auditLogs.requestUrl,
        status: auditLogs.status,
        createdAt: auditLogs.createdAt,
        user: {
          fullName: users.fullName,
          email: users.email
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  getAuditLogById: async (id) => {
    const result = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        module: auditLogs.module,
        entityId: auditLogs.entityId,
        entityName: auditLogs.entityName,
        oldData: auditLogs.oldData,
        newData: auditLogs.newData,
        description: auditLogs.description,
        ipAddress: auditLogs.ipAddress,
        browser: auditLogs.browser,
        operatingSystem: auditLogs.operatingSystem,
        deviceType: auditLogs.deviceType,
        requestMethod: auditLogs.requestMethod,
        requestUrl: auditLogs.requestUrl,
        status: auditLogs.status,
        createdAt: auditLogs.createdAt,
        user: {
          fullName: users.fullName,
          email: users.email
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new ApiError(404, "Audit log not found", "AUDIT_LOG_NOT_FOUND");
    }

    return result[0];
  },

  getAuditLogsByModule: async (moduleName, query) => {
    return auditService.getAuditLogs({ ...query, moduleName });
  },

  getAuditLogsByUser: async (userId, query) => {
    return auditService.getAuditLogs({ ...query, userId });
  },

  getAuditLogsByEntity: async (entityId, query) => {
    return auditService.getAuditLogs({ ...query, entityId });
  }
};
