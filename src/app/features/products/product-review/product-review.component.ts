
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../../StarRating/StarRating.component';
import { AddReviewDto, ReviewResponseDto, ReviewService } from '../../../core/services/review-service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, DatePipe],
  templateUrl: './product-review.component.html',
  styleUrls: ['./product-review.component.css']
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;
  
  reviews: ReviewResponseDto[] = [];
  summary: string[] = [];
  loading = false;
  loadingSummary = false;
  submitting = false;
  error = '';
  
  newReview: AddReviewDto = {
    rate: 0,
    reviewText: '',
    productId: this.productId,
    images: []
  };
  
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(private reviewService: ReviewService) { }

  ngOnInit() {
    console.log('ProductReviewsComponent initialized with productId:', this.productId);
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.error = '';
    
    this.reviewService.getAllProductReviews(this.productId)
      .pipe(
        catchError((err: any) => {
          console.error('Error loading reviews:', err);
          this.error = 'Failed to load reviews. Please try again.';
          return of({ 
            statusCode: 'ERROR', 
            succeeded: false, 
            message: 'Error', 
            errors: err, 
            data: [] 
          } as any);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response: any) => {
        if (response.succeeded) {
          this.reviews = response.data || [];
        } else {
          this.error = response.message || 'Failed to load reviews';
        }
      });
  }

  loadSummary() {
    this.loadingSummary = true;
    this.summary = [];
    this.error = '';
    
    this.reviewService.getReviewsSummary(this.productId)
      .pipe(
        catchError((err: any) => {
          console.error('Error loading summary:', err);
          this.error = 'Failed to generate summary. Please try again.';
          return of({ 
            statusCode: 'ERROR', 
            succeeded: false, 
            message: 'Error', 
            errors: err, 
            data: [] 
          } as any);
        }),
        finalize(() => this.loadingSummary = false)
      )
      .subscribe((response: any) => {
        if (response.succeeded) {
          this.summary = response.data || [];
          if (this.summary.length === 0) {
            this.summary = ['No summary available for this product.'];
          }
        } else {
          this.error = response.message || 'Failed to generate summary';
        }
      });
  }

  onSubmit() {
    if (!this.newReview.rate || !this.newReview.reviewText.trim()) {
      this.error = 'Please provide both a rating and review text.';
      return;
    }

    this.submitting = true;
    this.error = '';
    
    this.newReview.productId = this.productId;
    this.newReview.images = this.selectedFiles;

    this.reviewService.addReview(this.newReview)
      .pipe(
        catchError((err: any) => {
          console.error('Error submitting review:', err);
          this.error = 'Failed to submit review. Please try again.';
          return of({ 
            statusCode: 'ERROR', 
            succeeded: false, 
            message: 'Error', 
            errors: err, 
            data: null 
          } as any);
        }),
        finalize(() => this.submitting = false)
      )
      .subscribe((response: any) => {
        if (response.succeeded && response.data) {
          this.reviews.unshift(response.data);
          this.resetForm();
          this.summary = []; // Clear summary since it's now outdated
        } else {
          this.error = response.message || 'Failed to submit review';
        }
      });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files) return;

    this.selectedFiles = [];
    this.imagePreviews = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match('image.*')) {
        this.selectedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  resetForm() {
    this.newReview = {
      rate: 0,
      reviewText: '',
      productId: this.productId,
      images: []
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
  }

  trackById(index: number, item: ReviewResponseDto) {
    return item.id;
  }
}