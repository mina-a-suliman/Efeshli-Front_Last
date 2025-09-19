// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-home',
//   imports: [CommonModule],
//   templateUrl: './home.html',
//   styleUrls: ['./home.css']
// })
// export class HomeComponent implements OnInit {
//   currentIndex = 0;
//   items = [
//     {
//       icon: 'fas fa-palette',
//       title: 'Ready to Style',
//       subtitle: 'Wall-Mounted Decor',
//       description: 'Transform your walls with our elegant and easy-to-install decorative pieces.'
//     },
//     {
//       icon: 'fas fa-thumbtack',
//       title: 'Ready to Hang',
//       subtitle: 'The Table Edit',
//       description: 'Beautiful table decorations that add character to any room in your home.'
//     },
//     {
//       icon: 'fas fa-gem',
//       title: 'Ready to Shine',
//       subtitle: 'New Arrivals',
//       description: 'Discover our latest collection of decorative objects that will brighten your space.'
//     },
//     {
//       icon: 'fas fa-lightbulb',
//       title: 'Ready to Glow',
//       subtitle: 'The Lighting Edit',
//       description: 'Create the perfect ambiance with our selection of decorative lighting solutions.'
//     }
//   ];

//   constructor() { }

//   ngOnInit(): void {
//     // Auto-advance slides
//     setInterval(() => {
//       this.next();
//     }, 5000);
//   }

//   next(): void {
//     this.currentIndex = (this.currentIndex + 1) % this.items.length;
//   }

//   prev(): void {
//     this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
//   }

//   goto(index: number): void {
//     this.currentIndex = index;
//   }
// }
