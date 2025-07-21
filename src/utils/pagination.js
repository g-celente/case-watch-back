import config from '../config/index.js';

export class PaginationUtils {
  static getPaginationData(page, limit) {
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.min(
      config.MAX_PAGE_SIZE,
      Math.max(1, parseInt(limit) || config.DEFAULT_PAGE_SIZE)
    );
    
    const skip = (pageNumber - 1) * limitNumber;
    
    return {
      page: pageNumber,
      limit: limitNumber,
      skip
    };
  }

  static getPaginationInfo(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null
    };
  }
}
