import { logAuditEvent } from "@/server/audit";

interface HighLevelConfig {
  apiKey: string;
  locationId: string;
  baseUrl?: string;
}

interface HighLevelContact {
  id?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

interface HighLevelMessageRequest {
  type: "Email" | "SMS";
  contactId?: string;
  email?: string;
  phone?: string;
  fromNumber?: string;
  subject?: string;
  html?: string;
  message?: string;
  templateId?: string;
}

interface HighLevelWorkflowRequest {
  workflowId: string;
  contactId?: string;
  email?: string;
  phone?: string;
  customData?: Record<string, unknown>;
}

export class HighLevelService {
  private config: HighLevelConfig;
  private baseUrl: string;

  constructor(config: HighLevelConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://rest.gohighlevel.com";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/v1${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HighLevel API error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  async getContacts(limit = 100): Promise<HighLevelContact[]> {
    const data = await this.request<{ contacts: HighLevelContact[] }>(
      `/contacts/?limit=${limit}&locationId=${this.config.locationId}`
    );
    return data.contacts || [];
  }

  async getContact(contactId: string): Promise<HighLevelContact | null> {
    try {
      return await this.request<HighLevelContact>(`/contacts/${contactId}`);
    } catch {
      return null;
    }
  }

  async createOrUpdateContact(contact: HighLevelContact): Promise<string> {
    const payload = {
      ...contact,
      locationId: this.config.locationId,
    };

    if (contact.id) {
      await this.request(`/contacts/${contact.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return contact.id;
    }

    const result = await this.request<{ contact: { id: string } }>("/contacts/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return result.contact.id;
  }

  async sendMessage(request: HighLevelMessageRequest): Promise<{ success: boolean; messageId?: string }> {
    const payload = {
      ...request,
      locationId: this.config.locationId,
    };

    const result = await this.request<{ success: boolean; messageId?: string }>(
      "/conversations/messages",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    return result;
  }

  async sendEmail(toEmail: string, subject: string, htmlBody: string, contactId?: string): Promise<{ success: boolean }> {
    return this.sendMessage({
      type: "Email",
      email: toEmail,
      subject,
      html: htmlBody,
      contactId,
    });
  }

  async sendSms(toPhone: string, message: string, contactId?: string): Promise<{ success: boolean }> {
    return this.sendMessage({
      type: "SMS",
      phone: toPhone,
      message,
      contactId,
    });
  }

  async addContactToWorkflow(request: HighLevelWorkflowRequest): Promise<{ success: boolean }> {
    const payload = {
      workflowId: request.workflowId,
      locationId: this.config.locationId,
      contactId: request.contactId,
      email: request.email,
      phone: request.phone,
      ...request.customData,
    };

    return this.request<{ success: boolean }>(
      `/workflows/trigger`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async getWorkflows(): Promise<{ id: string; name: string; status: string }[]> {
    const data = await this.request<{ workflows: { id: string; name: string; status: string }[] }>(
      `/workflows/?locationId=${this.config.locationId}`
    );
    return data.workflows || [];
  }

  async getOpportunities(limit = 100): Promise<unknown[]> {
    const data = await this.request<{ opportunities: unknown[] }>(
      `/opportunities/?limit=${limit}&locationId=${this.config.locationId}`
    );
    return data.opportunities || [];
  }

  async getPipelines(): Promise<{ id: string; name: string }[]> {
    const data = await this.request<{ pipelines: { id: string; name: string }[] }>(
      `/pipelines/?locationId=${this.config.locationId}`
    );
    return data.pipelines || [];
  }

  async updateOpportunityStage(opportunityId: string, stageId: string): Promise<void> {
    await this.request(`/opportunities/${opportunityId}`, {
      method: "PUT",
      body: JSON.stringify({ stageId, locationId: this.config.locationId }),
    });
  }

  async createTask(contactId: string, title: string, description?: string, dueDate?: string): Promise<{ id: string }> {
    return this.request<{ id: string }>("/tasks/", {
      method: "POST",
      body: JSON.stringify({
        contactId,
        title,
        description,
        dueDate,
        locationId: this.config.locationId,
      }),
    });
  }
}

export function createHighLevelService(): HighLevelService {
  const apiKey = process.env.HIGHLEVEL_API_KEY;
  const locationId = process.env.HIGHLEVEL_LOCATION_ID;

  if (!apiKey || !locationId) {
    throw new Error("HighLevel API key and location ID are not configured");
  }

  return new HighLevelService({ apiKey, locationId });
}

export async function syncContactToHighLevel(
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    tags?: string[];
  },
  userId: string,
  organizationId: string
): Promise<string> {
  const service = createHighLevelService();

  const highLevelContactId = await service.createOrUpdateContact({
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    tags: contact.tags || [],
    customFields: {
      nc_fitness_contact_id: contact.id,
      nc_fitness_source: "platform",
    },
  });

  await logAuditEvent({
    action: "sync_contact_to_highlevel",
    category: "integration",
    userId,
    resourceType: "contact",
    resourceId: contact.id,
    organizationId,
    metadata: { highLevelContactId },
  });

  return highLevelContactId;
}
