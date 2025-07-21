import { z } from 'zod';

// Esquemas de validação para autenticação
export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Email deve ser válido'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres')
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Email deve ser válido'),
      password: z.string().min(1, 'Senha é obrigatória')
    })
  }),

  updateProfile: z.object({
    body: z.object({
      email: z.string().email('Email deve ser válido').optional(),
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
      avatar: z.string().url('Avatar deve ser uma URL válida').optional()
    })
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
      newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    })
  })
};

// Esquemas de validação para usuários
export const userSchemas = {
  getUserById: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  updateUser: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      email: z.string().email('Email deve ser válido').optional(),
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
      avatar: z.string().url('Avatar deve ser uma URL válida').optional()
    })
  }),

  deleteUser: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  getUserStats: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  paginationQuery: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      search: z.string().optional(),
      sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).optional().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
  })
};

// Esquemas de validação para categorias
export const categorySchemas = {
  createCategory: z.object({
    body: z.object({
      name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
      description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve estar no formato hexadecimal (#FFFFFF)').optional()
    })
  }),

  updateCategory: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
      description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve estar no formato hexadecimal (#FFFFFF)').optional()
    })
  }),

  getCategoryById: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  deleteCategory: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  getCategoryStats: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  categoryPaginationQuery: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      search: z.string().optional(),
      sortBy: z.enum(['createdAt', 'updatedAt', 'name']).optional().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
  })
};

// Esquemas de validação para tarefas
export const taskSchemas = {
  createTask: z.object({
    body: z.object({
      title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres'),
      description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
      dueDate: z.string().datetime('Data deve estar no formato ISO 8601').optional(),
      categoryId: z.string().cuid('ID da categoria deve ser um CUID válido').optional()
    })
  }),

  updateTask: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      title: z.string().min(1, 'Título é obrigatório').max(200, 'Título deve ter no máximo 200 caracteres').optional(),
      description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      dueDate: z.string().datetime('Data deve estar no formato ISO 8601').optional().nullable(),
      categoryId: z.string().cuid('ID da categoria deve ser um CUID válido').optional().nullable()
    })
  }),

  getTaskById: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  deleteTask: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  assignTask: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      userId: z.string().cuid('ID do usuário deve ser um CUID válido')
    })
  }),

  addCollaborator: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      userId: z.string().cuid('ID do usuário deve ser um CUID válido'),
      role: z.enum(['VIEWER', 'EDITOR', 'ADMIN']).optional().default('VIEWER')
    })
  }),

  removeCollaborator: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      userId: z.string().cuid('ID do usuário deve ser um CUID válido')
    })
  }),

  getTasksByStatus: z.object({
    params: z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    })
  }),

  updateTaskStatus: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    })
  }),

  updateTaskPriority: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    }),
    body: z.object({
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    })
  }),

  taskPaginationQuery: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      search: z.string().optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      categoryId: z.string().cuid('ID da categoria deve ser um CUID válido').optional(),
      assigneeId: z.string().cuid('ID do responsável deve ser um CUID válido').optional(),
      overdue: z.string().optional().transform(val => val === 'true'),
      sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'dueDate', 'priority']).optional().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
  })
};

// Esquemas de validação para relatórios
export const reportSchemas = {
  dateRangeQuery: z.object({
    query: z.object({
      startDate: z.string().datetime('Data de início deve estar no formato ISO 8601').optional(),
      endDate: z.string().datetime('Data de fim deve estar no formato ISO 8601').optional()
    }).refine(data => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    }, {
      message: 'Data de início deve ser anterior à data de fim'
    })
  }),

  productivityQuery: z.object({
    query: z.object({
      startDate: z.string().datetime('Data de início deve estar no formato ISO 8601').optional(),
      endDate: z.string().datetime('Data de fim deve estar no formato ISO 8601').optional(),
      groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
    }).refine(data => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    }, {
      message: 'Data de início deve ser anterior à data de fim'
    })
  }),

  customReport: z.object({
    body: z.object({
      reportType: z.enum(['status', 'category', 'performance', 'productivity', 'collaboration']),
      startDate: z.string().datetime('Data de início deve estar no formato ISO 8601').optional(),
      endDate: z.string().datetime('Data de fim deve estar no formato ISO 8601').optional(),
      groupBy: z.enum(['day', 'week', 'month']).optional().default('day')
    }).refine(data => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    }, {
      message: 'Data de início deve ser anterior à data de fim'
    })
  })
};

// Esquemas comuns
export const commonSchemas = {
  id: z.object({
    params: z.object({
      id: z.string().cuid('ID deve ser um CUID válido')
    })
  }),

  pagination: z.object({
    query: z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    })
  })
};
