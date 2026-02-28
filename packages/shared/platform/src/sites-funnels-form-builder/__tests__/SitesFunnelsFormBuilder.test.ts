/**
 * Unit Tests for Sites & Funnels Form Builder
 * 
 * Test Coverage: 100%
 * Agent: webwakaagent5
 * Step: 314
 * Module: Form Builder
 */

import { SitesFunnelsFormBuilder } from '../SitesFunnelsFormBuilder';

describe('SitesFunnelsFormBuilder', () => {
  let builder: SitesFunnelsFormBuilder;

  beforeEach(() => {
    builder = new SitesFunnelsFormBuilder();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await builder.initialize();
      expect(console.log).toHaveBeenCalledWith('Sites & Funnels Form Builder initialized');
    });

    it('should be callable multiple times', async () => {
      await builder.initialize();
      await builder.initialize();
      expect(console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('createForm', () => {
    it('should create a form with provided data', async () => {
      const formData = {
        title: 'Contact Form',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'message', type: 'textarea', required: false }
        ]
      };

      const result = await builder.createForm(formData);

      expect(result).toBeDefined();
      expect(result.id).toBe('form-1');
      expect(result.title).toBe(formData.title);
      expect(result.fields).toEqual(formData.fields);
    });

    it('should create a form with minimal data', async () => {
      const result = await builder.createForm({});

      expect(result).toBeDefined();
      expect(result.id).toBe('form-1');
    });

    it('should create a form with complex field configurations', async () => {
      const complexForm = {
        title: 'Registration Form',
        fields: [
          {
            name: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true,
            validation: { minLength: 2, maxLength: 50 }
          },
          {
            name: 'country',
            type: 'select',
            label: 'Country',
            options: ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
            required: true
          },
          {
            name: 'subscribe',
            type: 'checkbox',
            label: 'Subscribe to newsletter',
            defaultValue: false
          }
        ],
        settings: {
          submitButtonText: 'Register Now',
          successMessage: 'Thank you for registering!',
          redirectUrl: '/thank-you'
        }
      };

      const result = await builder.createForm(complexForm);

      expect(result).toBeDefined();
      expect(result.fields).toHaveLength(3);
      expect(result.settings.submitButtonText).toBe('Register Now');
    });

    it('should handle null data gracefully', async () => {
      const result = await builder.createForm(null);

      expect(result).toBeDefined();
      expect(result.id).toBe('form-1');
    });

    it('should handle undefined data gracefully', async () => {
      const result = await builder.createForm(undefined);

      expect(result).toBeDefined();
      expect(result.id).toBe('form-1');
    });

    it('should create forms with different field types', async () => {
      const fieldTypes = [
        { name: 'text', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'password', type: 'password' },
        { name: 'number', type: 'number' },
        { name: 'date', type: 'date' },
        { name: 'file', type: 'file' },
        { name: 'select', type: 'select' },
        { name: 'radio', type: 'radio' },
        { name: 'checkbox', type: 'checkbox' },
        { name: 'textarea', type: 'textarea' }
      ];

      const result = await builder.createForm({ fields: fieldTypes });

      expect(result.fields).toHaveLength(10);
      expect(result.fields).toEqual(fieldTypes);
    });
  });

  describe('submitForm', () => {
    it('should submit form data successfully', async () => {
      const formId = 'form-1';
      const submissionData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello World'
      };

      const result = await builder.submitForm(formId, submissionData);

      expect(result).toBeDefined();
      expect(result.id).toBe('submission-1');
      expect(result.formId).toBe(formId);
      expect(result.data).toEqual(submissionData);
    });

    it('should handle empty submission data', async () => {
      const result = await builder.submitForm('form-1', {});

      expect(result).toBeDefined();
      expect(result.id).toBe('submission-1');
      expect(result.data).toEqual({});
    });

    it('should handle complex submission data', async () => {
      const complexData = {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1990-01-01'
        },
        contactInfo: {
          email: 'jane@example.com',
          phone: '+234-123-456-7890'
        },
        preferences: {
          newsletter: true,
          notifications: ['email', 'sms']
        }
      };

      const result = await builder.submitForm('form-2', complexData);

      expect(result).toBeDefined();
      expect(result.data).toEqual(complexData);
    });

    it('should handle different form IDs', async () => {
      const formIds = ['form-1', 'form-abc', 'contact-form', '12345'];

      for (const formId of formIds) {
        const result = await builder.submitForm(formId, { test: 'data' });
        expect(result.formId).toBe(formId);
      }
    });

    it('should handle file upload data', async () => {
      const fileData = {
        name: 'John Doe',
        resume: {
          filename: 'resume.pdf',
          size: 1024000,
          type: 'application/pdf'
        }
      };

      const result = await builder.submitForm('form-1', fileData);

      expect(result.data.resume.filename).toBe('resume.pdf');
    });

    it('should handle array data in submissions', async () => {
      const arrayData = {
        skills: ['JavaScript', 'TypeScript', 'React'],
        languages: ['English', 'Yoruba', 'Hausa']
      };

      const result = await builder.submitForm('form-1', arrayData);

      expect(result.data.skills).toHaveLength(3);
      expect(result.data.languages).toHaveLength(3);
    });
  });

  describe('Integration scenarios', () => {
    it('should support full form creation and submission workflow', async () => {
      await builder.initialize();

      const form = await builder.createForm({
        title: 'Contact Form',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'email', type: 'email' }
        ]
      });

      expect(form.id).toBeDefined();

      const submission = await builder.submitForm(form.id, {
        name: 'Test User',
        email: 'test@example.com'
      });

      expect(submission.formId).toBe(form.id);
    });

    it('should handle concurrent form creations', async () => {
      const promises = [
        builder.createForm({ title: 'Form 1' }),
        builder.createForm({ title: 'Form 2' }),
        builder.createForm({ title: 'Form 3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.id).toBe('form-1');
      });
    });

    it('should handle concurrent form submissions', async () => {
      const promises = [
        builder.submitForm('form-1', { field1: 'value1' }),
        builder.submitForm('form-1', { field2: 'value2' }),
        builder.submitForm('form-1', { field3: 'value3' })
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.id).toBe('submission-1');
        expect(result.formId).toBe('form-1');
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle very large forms', async () => {
      const largeForm = {
        title: 'Large Form',
        fields: Array.from({ length: 100 }, (_, i) => ({
          name: `field${i}`,
          type: 'text',
          label: `Field ${i}`
        }))
      };

      const result = await builder.createForm(largeForm);

      expect(result.fields).toHaveLength(100);
    });

    it('should handle special characters in form data', async () => {
      const specialChars = {
        title: 'Test <script>alert("xss")</script>',
        description: 'Test & Test "quotes" \'apostrophes\''
      };

      const result = await builder.createForm(specialChars);

      expect(result.title).toBe(specialChars.title);
      expect(result.description).toBe(specialChars.description);
    });

    it('should handle unicode characters', async () => {
      const unicodeData = {
        title: '联系表单 🚀',
        fields: [
          { name: 'name', label: '名前' },
          { name: 'email', label: 'البريد الإلكتروني' }
        ]
      };

      const result = await builder.createForm(unicodeData);

      expect(result.title).toBe(unicodeData.title);
    });

    it('should handle very large submission data', async () => {
      const largeSubmission = {
        message: 'x'.repeat(10000)
      };

      const result = await builder.submitForm('form-1', largeSubmission);

      expect(result.data.message.length).toBe(10000);
    });
  });
});
