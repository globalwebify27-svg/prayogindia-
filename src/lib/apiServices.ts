import { PRODUCTS, Product } from '@/data/mockData';
import { CATEGORIES, Category } from '@/data/mockData';
import { SERVICES_DATA, ServiceItem } from '@/data/servicesData';
import { LEARNING_RESOURCES, LearningResource } from '@/data/learningData';
import { OFFERS_DATA, OfferItem } from '@/data/offersData';
import { MOCK_CUSTOMER_ORDERS, CustomerOrder, MOCK_SUPPORT_TICKETS, SupportTicket } from '@/data/accountData';
import { apiClient } from '@/lib/apiClient';

/**
 * Service Abstraction Layer:
 * Seamlessly interfaces with mock data when process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'
 * or fetches real backend JSON from production APIs when connected.
 */

// 1. Products API
export async function getProducts(categorySlug?: string, searchQuery?: string): Promise<Product[]> {
  try {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') {
      const params = new URLSearchParams();
      if (categorySlug) params.append('category', categorySlug);
      if (searchQuery) params.append('q', searchQuery);
      return await apiClient<Product[]>(`/products?${params.toString()}`);
    }
  } catch (err) {
    console.warn('Falling back to local mock dataset for Products', err);
  }

  let result = [...PRODUCTS];
  if (categorySlug && categorySlug !== 'all') {
    result = result.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase());
  }
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') {
      return await apiClient<Product>(`/products/${slug}`);
    }
  } catch (err) {
    console.warn('Falling back to local mock dataset for Product slug', err);
  }

  return PRODUCTS.find(p => p.id === slug || p.name.toLowerCase().replace(/\s+/g, '-').includes(slug)) || PRODUCTS[0];
}

export async function getSearchSuggestions(query: string) {
  try {
    const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch search suggestions', err);
  }
  return [];
}

export async function getFilterMetadata() {
  try {
    const res = await fetch('/api/products/filters');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch filter metadata', err);
  }
  return null;
}

export async function getRelatedProducts(slug: string, limit = 4) {
  try {
    const res = await fetch(`/api/products/${slug}/related?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch related products', err);
  }
  return [];
}

// 2. Categories API
export async function getCategories(): Promise<Category[]> {
  try {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') {
      return await apiClient<Category[]>('/categories');
    }
  } catch (err) {
    console.warn('Falling back to local mock dataset for Categories', err);
  }

  return CATEGORIES;
}

// 3. Services API
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const res = await fetch('/api/services');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Services', err);
  }

  return SERVICES_DATA;
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  try {
    const res = await fetch(`/api/services/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Service Slug', err);
  }

  return SERVICES_DATA.find(s => s.slug === slug || s.id === slug) || SERVICES_DATA[0];
}

export async function submitServiceEnquiry(payload: {
  serviceId?: string;
  serviceName?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    const res = await fetch('/api/service-enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to submit enquiry', err);
    return { success: false, message: 'Network error submitting enquiry.' };
  }
}

// 4. Learning Resources API
export async function getLearningResources(searchQuery?: string, category?: string, level?: string): Promise<LearningResource[]> {
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (category) params.append('category', category);
    if (level) params.append('level', level);

    const res = await fetch(`/api/learning?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.items) return data.data.items;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Learning Resources', err);
  }

  let result = [...LEARNING_RESOURCES];
  if (category && category !== 'all') {
    result = result.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(r => r.title.toLowerCase().includes(q) || r.shortDescription.toLowerCase().includes(q));
  }
  return result;
}

export async function getLearningResourceBySlug(slug: string): Promise<LearningResource | null> {
  try {
    const res = await fetch(`/api/learning/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Learning Slug', err);
  }

  return LEARNING_RESOURCES.find(l => l.slug === slug || l.id === slug) || LEARNING_RESOURCES[0];
}

// 5. Offers API
export async function getOffers(): Promise<OfferItem[]> {
  try {
    const res = await fetch('/api/offers');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Offers', err);
  }

  return OFFERS_DATA;
}

export async function getOfferBySlug(slug: string): Promise<OfferItem | null> {
  try {
    const res = await fetch(`/api/offers/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Offer Slug', err);
  }

  return OFFERS_DATA.find(o => o.slug === slug || o.id === slug) || OFFERS_DATA[0];
}

// 6. Orders API (Customer Private)
export async function createCustomerOrder(shippingAddress?: string, addressId?: string) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddress, addressId }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create order via backend API', err);
    return { success: false, message: 'Network error creating order.' };
  }
}

export async function getCustomerOrders(page = 1, limit = 10): Promise<{ items: CustomerOrder[]; total: number; totalPages: number }> {
  try {
    const res = await fetch(`/api/orders?page=${page}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.items) {
        return {
          items: data.data.items,
          total: data.data.total,
          totalPages: data.data.totalPages,
        };
      }
    }
  } catch (err) {
    console.warn('Falling back to local mock dataset for Orders', err);
  }

  return {
    items: MOCK_CUSTOMER_ORDERS,
    total: MOCK_CUSTOMER_ORDERS.length,
    totalPages: 1,
  };
}

export async function getOrderById(orderId: string): Promise<CustomerOrder | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('Falling back to local mock dataset for Order Detail', err);
  }

  return MOCK_CUSTOMER_ORDERS.find(o => o.id === orderId || o.orderNumber === orderId) || MOCK_CUSTOMER_ORDERS[0];
}

export async function getOrderTracking(orderId: string) {
  try {
    const res = await fetch(`/api/orders/${orderId}/tracking`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch tracking API', err);
  }
  return { success: false, message: 'Tracking information unavailable.' };
}

// 7. Support Tickets API (Customer Private)
export async function createSupportTicket(subject: string, category: string, message: string) {
  try {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, category, message }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create support ticket', err);
    return { success: false, message: 'Network error creating ticket.' };
  }
}

export async function getSupportTickets(page = 1, limit = 10): Promise<SupportTicket[]> {
  try {
    const res = await fetch(`/api/support/tickets?page=${page}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.items) {
        return data.data.items;
      }
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Support Tickets', err);
  }

  return MOCK_SUPPORT_TICKETS;
}

export async function getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) return data.data;
    }
  } catch (err) {
    console.warn('Falling back to local dataset for Support Ticket detail', err);
  }

  return MOCK_SUPPORT_TICKETS.find(t => t.id === ticketId || t.ticketNumber === ticketId) || MOCK_SUPPORT_TICKETS[0];
}

export async function addSupportMessage(ticketId: string, text: string) {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send reply message', err);
    return { success: false, message: 'Network error sending message.' };
  }
}

export async function closeSupportTicket(ticketId: string) {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/close`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to close ticket', err);
    return { success: false, message: 'Network error closing ticket.' };
  }
}

// 8. Notifications API (Customer Private)
export async function getCustomerNotifications(page = 1, limit = 10) {
  try {
    const res = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch customer notifications', err);
  }
  return { success: true, data: { items: [], total: 0, totalPages: 0 } };
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await fetch('/api/notifications/unread-count');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.data.unreadCount || 0;
    }
  } catch (err) {
    console.warn('Failed to fetch unread notification count', err);
  }
  return 0;
}

export async function markNotificationAsRead(id: string) {
  try {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    return await res.json();
  } catch {
    return { success: false, message: 'Network error.' };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
    return await res.json();
  } catch {
    return { success: false, message: 'Network error.' };
  }
}
