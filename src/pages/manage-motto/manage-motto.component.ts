import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ApiMottoService } from '../../shared/services/api/api-motto/api-motto.service';
import { IMotto, IMottoDTO } from '../../shared/models/motto.models';

@Component({
  selector: 'app-manage-motto',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './manage-motto.component.html',
  styleUrls: ['./manage-motto.component.scss']
})
export class ManageMottoComponent implements OnInit {
  #mottoService = inject(ApiMottoService);
  
  mottos = signal<IMotto[]>([]);
  displayedColumns: string[] = ['id', 'motto', 'reference', 'actions'];
  
  // Form model
  currentMotto: IMottoDTO & { id?: number } = { motto: '', reference: '' };
  isEditing = false;

  ngOnInit(): void {
    this.loadMottos();
  }

  loadMottos(): void {
    this.#mottoService.getAllMottos().subscribe({
      next: (mottos) => {
        this.mottos.set(mottos || []);
      },
      error: (err) => {
        console.error('Failed to load mottos', err);
      }
    });
  }

  onSubmit(): void {
    if (!this.currentMotto.motto || !this.currentMotto.reference) {
      alert('Please fill in both motto and reference');
      return;
    }

    if (this.isEditing && this.currentMotto.id) {
      this.#mottoService.updateMotto(this.currentMotto.id.toString(), {
        motto: this.currentMotto.motto,
        reference: this.currentMotto.reference
      }).subscribe({
        next: () => {
          this.loadMottos();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to update motto', err);
          alert('Failed to update motto');
        }
      });
    } else {
      this.#mottoService.createMotto({
        motto: this.currentMotto.motto,
        reference: this.currentMotto.reference
      }).subscribe({
        next: () => {
          this.loadMottos();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to create motto', err);
          alert('Failed to create motto');
        }
      });
    }
  }

  editMotto(motto: IMotto): void {
    this.isEditing = true;
    this.currentMotto = { ...motto };
  }

  deleteMotto(id: number): void {
    if (confirm('Are you sure you want to delete this motto?')) {
      this.#mottoService.deleteMotto(id.toString()).subscribe({
        next: () => {
          this.loadMottos();
        },
        error: (err) => {
          console.error('Failed to delete motto', err);
          alert('Failed to delete motto');
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentMotto = { motto: '', reference: '' };
  }
}
