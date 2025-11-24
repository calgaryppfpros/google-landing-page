
import { QuoteState, ServiceType } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const submitLead = async (payload: QuoteState): Promise<boolean> => {
  const enrichedPayload = {
    ...payload,
    submittedAt: new Date().toISOString(),
    source: window.location.href,
    userAgent: navigator.userAgent,
    formType: 'Smart Quote Widget'
  };

  console.log('🚀 Submitting Lead Payload to Webhook:', enrichedPayload);
  
  try {
    const response = await fetch('https://n8n.srv1046173.hstgr.cloud/webhook-test/ppfprosformai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Sending structured JSON as top-level properties (not a single text blob)
      body: JSON.stringify(enrichedPayload),
    });

    if (!response.ok) {
      console.error('Webhook returned status:', response.status);
      throw new Error('Network response was not ok');
    }

    // GTM Tracking Event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submission',
        form_type: 'smart_quote_widget',
        services_count: payload.services.length,
        has_ppf: payload.services.includes(ServiceType.PPF),
        has_ceramic: payload.services.includes(ServiceType.CERAMIC),
        has_tint: payload.services.includes(ServiceType.TINT)
      });
    }

  } catch (error) {
    console.error('Error submitting lead:', error);
    // Depending on business requirements, you might want to suppress this error 
    // to show the success screen to the user regardless, but logging is critical.
    throw error;
  }

  // Simulate slight delay for UX if the API is too fast, gives the user a sense of processing
  // await new Promise(resolve => setTimeout(resolve, 500));

  return true; 
};
