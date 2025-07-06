import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  @Input() currentPageIndex: number = 1;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();
  PageWindowSize: number = 5;


  PageNumbers(): number[] {
    const pages: number[] = []

    const startPageNumber = Math.floor((this.currentPageIndex - 1) / this.PageWindowSize) * this.PageWindowSize + 1;
    const endPageNumber = Math.min(startPageNumber + this.PageWindowSize - 1, this.totalPages);

    for (let index = startPageNumber; index <= endPageNumber; index++) {
      pages.push(index);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextWindow(): void {
    const nextPage = this.PageNumbers()[this.PageNumbers().length - 1] + 1;
    if (nextPage <= this.totalPages) {
      this.changePage(nextPage);
    }
  }


  prevWindow(): void {
    const prevPage = this.PageNumbers()[0] - 1;
    if (prevPage >= 1) {
      this.changePage(prevPage);
    }
  }
}