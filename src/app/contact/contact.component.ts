import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from "../shared/map/map.component";
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { NominatimService } from '../services/nominatim.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MapComponent, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm = new FormGroup({
    'fullName': new FormControl<string | null>(null, Validators.required),
    'email': new FormControl<string | null>(null, [Validators.required, Validators.email]),
    'city': new FormControl<string | null>(null),
    'postalCode': new FormControl<string | null>(null),
    'address': new FormControl<string | null>(null),
    'message': new FormControl<string | null>(null),
    'terms': new FormControl<boolean>(false, Validators.requiredTrue)
  });

  addressSuggestions: any[] = [];
  showSuggestions = false;
  isSubmitting = false;
  submitMessage = '';

  constructor(private nominatim: NominatimService) {
    this.contactForm.get('address')?.valueChanges?.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const val = (value ?? '').toString();
        if (val && val.length > 2) {
          return this.nominatim.search(val);
        } else {
          return of([]);
        }
      })
    ).subscribe(results => {
      this.addressSuggestions = results || [];
      this.showSuggestions = this.addressSuggestions.length > 0;
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      this.submitMessage = '';
      this.contactForm.disable({ emitEvent: false });

      const raw = this.contactForm.getRawValue();
      const templateParams = {
        fullName: raw.fullName,
        email: raw.email,
        city: raw.city,
        postalCode: raw.postalCode,
        address: raw.address,
        message: raw.message
      } as Record<string, any>;

      emailjs.send(
        'smelly_cat',
        'template_xnmrr73',     
        templateParams,
        '727E-EGLO6xY0RUd1'      
      ).then(
        (_response: unknown) => {
          this.submitMessage = 'Message sent successfully!';
          this.contactForm.reset();
          this.contactForm.enable({ emitEvent: false });
          this.isSubmitting = false;
        },
        (_error: unknown) => {
          this.submitMessage = 'Failed to send message. Please try again.';
          this.contactForm.enable({ emitEvent: false });
          this.isSubmitting = false;
        }
      );
    }
  }

  selectSuggestion(suggestion: any) {
    const { address } = this.contactForm.controls;
    
    const houseNumber = suggestion.address?.house_number || 
      (address.value as string | null)?.match(/\d+/)?.[0] ||  
      '';
    
    const roadName = suggestion.address?.road || 
      suggestion.name || 
      suggestion.display_name;
    
    const fullAddress = houseNumber ? `${roadName} ${houseNumber}` : roadName;

    const city = suggestion.address?.city || 
      suggestion.address?.town || 
      suggestion.address?.village ||
      suggestion.address?.municipality?.replace('Municipality of ', '').replace('Municipal of ', '') ||  
      '';

    this.contactForm.patchValue({
      address: fullAddress,
      city: city,
      postalCode: suggestion.address?.postcode || ''
    });

    this.showSuggestions = false;
  }

  hideSuggestionsWithDelay() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}
