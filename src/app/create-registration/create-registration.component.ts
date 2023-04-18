import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { NgToastService } from 'ng-angular-popup';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-create-registration',
  templateUrl: './create-registration.component.html',
  styleUrls: ['./create-registration.component.scss']
})
export class CreateRegistrationComponent implements OnInit {
  public packages = ["Mensuel", "Trimestriel", "Annuel"];
  public genres = ["Masculin", "Féminin"];
  public importantList: string[] = [
    "Réduction des graisses toxiques",
    "Énergie et endurance",
    "Construire du muscle maigre",
    "Système digestif plus sain",
    "Corps en manque de sucre",
    "Fitnesse"
  ];

  public registrationForm!: FormGroup;
  public userIdToUpdate!: number;
  public isUpdateActive!: boolean;

  constructor(private fb: FormBuilder, 
    private api: ApiService, 
    private activedRoute: ActivatedRoute,
    private toastService: NgToastService) {

  }
  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      prenom: [''],
      nom: [''],
      email: [''],
      telephone: [''],
      poids: [''],
      taille: [''],
      besoinEntraineur: [''],
      genre: [''],
      package: [''],
      important: [''],
      faitgym: [''],
      datedemande: [''],
      imc: [''],
      imcResult: [''],
    });

    this.registrationForm.controls['taille'].valueChanges.subscribe(res=>{
      this.calculerImc(res);
    });

    this.activedRoute.params.subscribe(val => {
      this.userIdToUpdate = val['id'];
      this.api.getRegisteredUserId(this.userIdToUpdate)
      .subscribe(res => {
        this.isUpdateActive = true;
        this.fillFormUpdate(res);
      })
    })

  }

  envoyer() {
    this.api.postRegistration(this.registrationForm.value)
      .subscribe(res => {
        this.toastService.success({ detail: "Succes", summary: "Enquete ajoutée", duration: 3000 });
        this.registrationForm.reset();
      })
  }

  calculerImc(tailleValue: number) {
    const poids = this.registrationForm.value.taille;
    const taille = tailleValue;
    const imc = poids / (taille * taille);
    this.registrationForm.controls['imc'].patchValue(imc);
    
    switch(true) {
      
      case imc < 18.5: 
        this.registrationForm.controls['imcResult'].patchValue("Insuffisance pondérale");
      break;
      case (imc >= 18.5 && imc < 25): 
        this.registrationForm.controls['imcResult'].patchValue("Normal");
      break;
      case (imc >= 25 && imc < 30): 
        this.registrationForm.controls['imcResult'].patchValue("Surpoids");
      break;

      default:
        this.registrationForm.controls['imcResult'].patchValue("Obèse");
      break;
    }
  }

  fillFormUpdate(user: User) {
    this.registrationForm.setValue({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      poids: user.poids,
      taille: user.taille,
      imc: user.imc,
      imcResult: user.imcResult,
      genre: user.genre,
      besoinEntraineur: user.besoinEntraineur,
      package: user.package,
      important: user.important,
      faitgym: user.faitgym,
      datedemande: user.datedemande
    })
  }
}
