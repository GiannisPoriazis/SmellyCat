import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { NominatimService } from '../services/nominatim.service';
import { of } from 'rxjs';
import emailjs from '@emailjs/browser';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let nominatimService: jasmine.SpyObj<NominatimService>;

  beforeEach(async () => {
    const nominatimSpy = jasmine.createSpyObj('NominatimService', ['search']);

    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        { provide: NominatimService, useValue: nominatimSpy }
      ]
    })
      .compileComponents();

    nominatimService = TestBed.inject(NominatimService) as jasmine.SpyObj<NominatimService>;
    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize with an invalid form', () => {
      expect(component.contactForm.valid).toBeFalse();
    });

    it('should require fullName field', () => {
      const fullName = component.contactForm.get('fullName');
      expect(fullName?.valid).toBeFalse();
      expect(fullName?.hasError('required')).toBeTrue();

      fullName?.setValue('Giannis');
      expect(fullName?.valid).toBeTrue();
    });

    it('should require email field and validate email format', () => {
      const email = component.contactForm.get('email');
      expect(email?.valid).toBeFalse();
      expect(email?.hasError('required')).toBeTrue();

      email?.setValue('test');
      expect(email?.hasError('email')).toBeTrue();

      email?.setValue('test@mail.com');
      expect(email?.valid).toBeTrue();
    });

    it('should require terms checkbox to be checked', () => {
      const terms = component.contactForm.get('terms');
      expect(terms?.valid).toBeFalse();
      expect(terms?.hasError('required')).toBeTrue();

      terms?.setValue(true);
      expect(terms?.valid).toBeTrue();
    });

    it('should have optional city, postalCode, address, and message fields', () => {
      expect(component.contactForm.get('city')?.hasError('required')).toBeFalse();
      expect(component.contactForm.get('postalCode')?.hasError('required')).toBeFalse();
      expect(component.contactForm.get('address')?.hasError('required')).toBeFalse();
      expect(component.contactForm.get('message')?.hasError('required')).toBeFalse();
    });

    it('should be valid when all required fields are filled', () => {
      component.contactForm.patchValue({
        fullName: 'Giannis',
        email: 'giannis@gmail.com',
        terms: true
      });
      expect(component.contactForm.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.contactForm.patchValue({
        fullName: 'Giannis',
        email: 'giannis@gmail.com',
        city: 'Thessaloniki',
        postalCode: '54623',
        address: 'Aristotelous 16',
        message: 'Test message',
        terms: true
      });
    });

    it('should not submit if form is invalid', () => {
      component.contactForm.patchValue({ email: 'test' });
      spyOn(emailjs, 'send');

      component.onSubmit();

      expect(emailjs.send).not.toHaveBeenCalled();
      expect(component.isSubmitting).toBeFalse();
    });

    it('should call emailjs.send with correct parameters on valid submission', () => {
      spyOn(emailjs, 'send').and.returnValue(Promise.resolve({} as any));

      component.onSubmit();

      expect(emailjs.send).toHaveBeenCalledWith(
        'smelly_cat',
        'template_xnmrr73',
        jasmine.objectContaining({
          fullName: 'Giannis',
          email: 'giannis@gmail.com',
          city: 'Thessaloniki',
          postalCode: '54623',
          address: 'Aristotelous 16',
          message: 'Test message'
        }),
        '727E-EGLO6xY0RUd1'
      );
    });

    it('should disable form during submission', () => {
      spyOn(emailjs, 'send').and.returnValue(new Promise(() => { }));

      component.onSubmit();

      expect(component.isSubmitting).toBeTrue();
      expect(component.contactForm.disabled).toBeTrue();
    });

    it('should prevent double submission', () => {
      spyOn(emailjs, 'send').and.returnValue(new Promise(() => { }));

      component.onSubmit();
      component.onSubmit();

      expect(emailjs.send).toHaveBeenCalledTimes(1);
    });

    it('should show success message and reset form on successful submission', fakeAsync(() => {
      spyOn(emailjs, 'send').and.returnValue(Promise.resolve({} as any));

      component.onSubmit();
      tick();

      expect(component.submitMessage).toBe('Message sent successfully!');
      expect(component.isSubmitting).toBeFalse();
      expect(component.contactForm.enabled).toBeTrue();
      expect(component.contactForm.value.fullName).toBeNull();
    }));

    it('should show error message and re-enable form on failed submission', fakeAsync(() => {
      spyOn(emailjs, 'send').and.returnValue(Promise.reject('Error'));

      component.onSubmit();
      tick();

      expect(component.submitMessage).toBe('Failed to send message. Please try again.');
      expect(component.isSubmitting).toBeFalse();
      expect(component.contactForm.enabled).toBeTrue();
    }));
  });

  describe('Address Autocomplete', () => {
    it('should not trigger search for short input (less than 3 characters)', fakeAsync(() => {
      nominatimService.search.and.returnValue(of([]));

      component.contactForm.get('address')?.setValue('ab');
      tick(300);

      expect(nominatimService.search).not.toHaveBeenCalled();
    }));

    it('should trigger search after debounce delay for input with 3+ characters', fakeAsync(() => {
      nominatimService.search.and.returnValue(of([]));

      component.contactForm.get('address')?.setValue('Xanthippou 11');
      tick(300);

      expect(nominatimService.search).toHaveBeenCalledWith('Xanthippou 11');
    }));

    it('should display suggestions when search returns results', fakeAsync(() => {
      const mockResults = [
        {
          place_id: 1,
          display_name: 'Xanthippou 11, Agioi Anargyroi',
          address: {
            road: 'Xanthippou',
            house_number: '11',
            city: 'Agioi Anargyroi',
            postcode: '13562'
          }
        }
      ];
      nominatimService.search.and.returnValue(of(mockResults));

      component.contactForm.get('address')?.setValue('Xanthippou 11');
      tick(300);

      expect(component.addressSuggestions).toEqual(mockResults);
      expect(component.showSuggestions).toBeTrue();
    }));

    it('should hide suggestions when no results returned', fakeAsync(() => {
      nominatimService.search.and.returnValue(of([]));

      component.contactForm.get('address')?.setValue('sdhfiush347958');
      tick(300);

      expect(component.addressSuggestions).toEqual([]);
      expect(component.showSuggestions).toBeFalse();
    }));

    describe('Suggestion Selection', () => {
      it('should populate form fields when suggestion is selected', () => {
        const mockSuggestion = {
          place_id: 1,
          display_name: 'Xanthippou 11, Agioi Anargyroi',
          name: 'Xanthippou',
          address: {
            road: 'Xanthippou',
            house_number: '11',
            city: 'Agioi Anargyroi',
            postcode: '13562'
          }
        };

        component.selectSuggestion(mockSuggestion);

        expect(component.contactForm.get('address')?.value).toBe('Xanthippou 11');
        expect(component.contactForm.get('city')?.value).toBe('Agioi Anargyroi');
        expect(component.contactForm.get('postalCode')?.value).toBe('13562');
      });

      it('should hide suggestions after selection', () => {
        const mockSuggestion = {
          place_id: 1,
          display_name: 'Xanthippou',
          address: { road: 'Xanthippou' }
        };
        component.showSuggestions = true;

        component.selectSuggestion(mockSuggestion);

        expect(component.showSuggestions).toBeFalse();
      });

      it('should extract house number from current input if not in suggestion', () => {
        component.contactForm.get('address')?.setValue('Xanthippou 11, Agioi Anargyroi');
        const mockSuggestion = {
          place_id: 1,
          display_name: 'Xanthippou 11, Agioi Anargyroi',
          address: {
            road: 'Xanthippou',
            city: 'Agioi Anargyroi'
          }
        };

        component.selectSuggestion(mockSuggestion);

        expect(component.contactForm.get('address')?.value).toBe('Xanthippou 11');
      });

      it('should handle municipality with "Municipality of" prefix', () => {
        const mockSuggestion = {
          place_id: 1,
          display_name: 'Xanthippou, Municipality of Agioi Anargyroi',
          address: {
            road: 'Xanthippou',
            municipality: 'Municipality of Agioi Anargyroi'
          }
        };

        component.selectSuggestion(mockSuggestion);

        expect(component.contactForm.get('city')?.value).toBe('Agioi Anargyroi');
      });
    });

    describe('UI Interactions', () => {
      it('should hide suggestions after delay when hideSuggestionsWithDelay is called', fakeAsync(() => {
        component.showSuggestions = true;

        component.hideSuggestionsWithDelay();

        expect(component.showSuggestions).toBeTrue();
        tick(200);
        expect(component.showSuggestions).toBeFalse();
      }));
    });
  });
});