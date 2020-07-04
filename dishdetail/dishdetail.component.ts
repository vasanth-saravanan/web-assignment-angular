import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { DishService } from '../services/dish.service';
import { Dish } from '../shared/dish';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';
//import { trigger, state, style, animate, transition } from '@angular/animations';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]
})
export class DishdetailComponent implements OnInit {

   dish: Dish;
   errMess: string;
   dishIds: string[];
   prev: string;
   next: string;
   @ViewChild('cform') commentFormDirective;
   comment: Comment;
   commentForm: FormGroup;
   dishcopy: Dish;
   visibility = 'shown';

   formErrors = {
     'author': '',
     'comment':''
   };

   validationMessages = {
     'author': {
       'required':  'Author Name is required.',
       'minlength':  'Author name must be 2 characters long.'
     },
     'comment': {
     'comment': 'Comment is required.',
     'minlength':  'Author name must be atleast 1 characters long.'
     }
   };

   constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { }

    ngOnInit() {
      this.createForm();

      this.dishservice.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds);

      this.route.params.pipe(switchMap((params: Params) => { this.visibility = 
        'hidden'; return this.dishservice.getDish(params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this
      .setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
    }

    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)] ],
      rating: 5,
      comment: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      author:'',
      rating: 5,
      comment: ''
    });
  }

  onValueChanged(data?: any) {
    if(!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}

// import { Component, OnInit, ViewChild } from '@angular/core';
// import { DishService } from '../services/dish.service';
// import { Dish } from '../shared/dish';
// import { switchMap } from 'rxjs/operators';
// import { FormBuilder, FormGroup, Validators} from '@angular/forms';
// import { Comment } from '../shared/comment';

// import { Params, ActivatedRoute } from '@angular/router';
// import { Location } from '@angular/common';

// @Component({
//   selector: 'app-dishdetail',
//   templateUrl: './dishdetail.component.html',
//   styleUrls: ['./dishdetail.component.scss']
// })
// export class DishdetailComponent implements OnInit {

//    dish: Dish;
//    dishIds: string[];
//    prev: string;
//    next: string;
//    @ViewChild('cform') commentFormDirective;
//    comment: Comment;
//    commentForm: FormGroup;

//    formErrors = {
//      'author': '',
//      'comment':''
//    };

//    validationMessages = {
//      'author': {
//        'required':  'Author Name is required.',
//        'minlength':  'Author name must be 2 characters long.'
//      },
//      'comment': {
//      'comment': 'Comment is required.',
//      'minlength':  'Author name must be atleast 1 characters long.'
//      }
//    };

//    constructor(private dishservice: DishService,
//     private route: ActivatedRoute,
//     private location: Location,
//     private fb: FormBuilder) { }

//     ngOnInit() {
//       this.createForm();

//       this.dishservice.getDishIds()
//       .subscribe(dishIds => this.dishIds = dishIds);
//       this.route.params
//       .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
//       .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
//     }

//     setPrevNext(dishId: string) {
//       const index = this.dishIds.indexOf(dishId);
//       this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
//       this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
//     }

//   goBack(): void {
//     this.location.back();
//   }

//   createForm() {
//     this.commentForm = this.fb.group({
//       author: ['', [Validators.required, Validators.minLength(2)] ],
//       rating: 5,
//       comment: ['', [Validators.required, Validators.minLength(1)]]
//     });

//     this.commentForm.valueChanges
//       .subscribe(data => this.onValueChanged(data));

//     this.onValueChanged();
//   }

//   onSubmit() {
//     this.comment = this.commentForm.value;
//     this.comment.date = new Date().toISOString();
//     console.log(this.comment);
//     this.dish.comments.push(this.comment);
//     this.commentFormDirective.resetForm();
//     this.commentForm.reset({
//       author:'',
//       rating: 5,
//       comment: ''
//     });
//   }

//   onValueChanged(data?: any) {
//     if(!this.commentForm) { return; }
//     const form = this.commentForm;
//     for (const field in this.formErrors) {
//       if (this.formErrors.hasOwnProperty(field)) {
//         // clear previous error message (if any)
//         this.formErrors[field] = '';
//         const control = form.get(field);
//         if (control && control.dirty && !control.valid) {
//           const messages = this.validationMessages[field];
//           for (const key in control.errors) {
//             if (control.errors.hasOwnProperty(key)) {
//               this.formErrors[field] += messages[key] + ' ';
//             }
//           }
//         }
//       }
//     }
//   }
// } 