const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class RecurringTransactionService {
  static getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get all recurring transactions
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring transactions');
    }

    return response.json();
  }

  // Create a new recurring transaction
  static async create(data) {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create recurring transaction');
    }

    return response.json();
  }

  // Update a recurring transaction
  static async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update recurring transaction');
    }

    return response.json();
  }

  // Delete a recurring transaction
  static async delete(id) {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete recurring transaction');
    }

    return response.json();
  }

  // Toggle active status
  static async toggleActive(id) {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle recurring transaction');
    }

    return response.json();
  }
}

export default RecurringTransactionService;
