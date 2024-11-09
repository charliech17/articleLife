import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule, SizeProp } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faUserTie,
  faUserNinja,
  faUserNurse,
  faUserGraduate,
  faUserAstronaut,
  faPersonDress,
  faPersonSwimming,
  faPersonRifle,
  faPersonRunning,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-fa-users',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './fa-users.component.html',
  styleUrl: './fa-users.component.scss',
})
export class FaUsersComponent {
  $inputUser = input.required<IInputFaUser>({ alias: 'inputUser' });
  $iconSize = computed(() => this.$inputUser().size || 'sm');
  eFaUser = EInputFaUser;

  faUserIcons = {
    faUser,
    faUserTie,
    faUserNinja,
    faUserNurse,
    faUserGraduate,
    faUserAstronaut,
    faPersonDress,
    faPersonSwimming,
    faPersonRifle,
    faPersonRunning,
  };
}

interface IInputFaUser {
  type: EInputFaUser;
  size?: SizeProp;
}

export enum EInputFaUser {
  Default = 'Default',
  Tie = 'Tie',
  Ninja = 'Ninja',
  Nurse = 'Nurse',
  Graduate = 'Graduate',
  Astronaut = 'Astronaut',
  Dress = 'Dress',
  Swimming = 'Swimming',
  Rifle = 'Rifle',
  Running = 'Running',
}
