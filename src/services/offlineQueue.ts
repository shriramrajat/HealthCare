/**
 * Offline Queue Service
 * Manages queued submissions when the user is offline
 */

export interface QueuedSubmission {
  id: string;
  type: 'medication' | 'symptom' | 'appointment' | 'health-metric';
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

const QUEUE_STORAGE_KEY = 'healthcare_offline_queue';
const MAX_QUEUE_SIZE = 100;

class OfflineQueueService {
  private queue: QueuedSubmission[] = [];
  private isProcessing = false;
  private onlineListeners: Array<() => void> = [];

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored. Processing queued submissions...');
      this.processQueue();
      this.notifyOnlineListeners();
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost. Submissions will be queued.');
    });
  }

  /**
   * Check if the browser is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Add a submission to the queue
   */
  enqueue(submission: Omit<QueuedSubmission, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedSubmission: QueuedSubmission = {
      ...submission,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedSubmission);

    // Limit queue size
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE);
    }

    this.saveQueue();
    
    console.log(`Submission queued (${this.queue.length} items in queue):`, queuedSubmission);
    
    return id;
  }

  /**
   * Remove a submission from the queue
   */
  dequeue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  /**
   * Get all queued submissions
   */
  getQueue(): QueuedSubmission[] {
    return [...this.queue];
  }

  /**
   * Get queue count
   */
  getQueueCount(): number {
    return this.queue.length;
  }

  /**
   * Get queued submissions for a specific user
   */
  getUserQueue(userId: string): QueuedSubmission[] {
    return this.queue.filter(item => item.userId === userId);
  }

  /**
   * Process all queued submissions
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline() || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const queueCopy = [...this.queue];
      
      for (const submission of queueCopy) {
        try {
          await this.processSubmission(submission);
          this.dequeue(submission.id);
          console.log(`Successfully processed queued submission: ${submission.id}`);
        } catch (error) {
          console.error(`Failed to process queued submission: ${submission.id}`, error);
          
          // Increment retry count
          const index = this.queue.findIndex(item => item.id === submission.id);
          if (index !== -1) {
            this.queue[index].retryCount++;
            
            // Remove if too many retries
            if (this.queue[index].retryCount >= 3) {
              console.warn(`Removing submission after 3 failed retries: ${submission.id}`);
              this.dequeue(submission.id);
            } else {
              this.saveQueue();
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single submission
   */
  private async processSubmission(submission: QueuedSubmission): Promise<void> {
    // This will be implemented by the consuming code
    // For now, we'll throw an error to indicate it needs to be handled
    throw new Error('processSubmission must be implemented by the consumer');
  }

  /**
   * Set a custom processor for submissions
   */
  setProcessor(processor: (submission: QueuedSubmission) => Promise<void>): void {
    this.processSubmission = processor;
  }

  /**
   * Clear the entire queue
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Add listener for when connection is restored
   */
  addOnlineListener(listener: () => void): void {
    this.onlineListeners.push(listener);
  }

  /**
   * Remove online listener
   */
  removeOnlineListener(listener: () => void): void {
    this.onlineListeners = this.onlineListeners.filter(l => l !== listener);
  }

  /**
   * Notify all online listeners
   */
  private notifyOnlineListeners(): void {
    this.onlineListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in online listener:', error);
      }
    });
  }
}

// Export singleton instance
export const offlineQueueService = new OfflineQueueService();
