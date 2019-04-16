import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RogerthatEffects } from './rogerthat.effect';
import { rogerthatReducer } from './rogerthat.reducer';

@NgModule({
  imports: [
    EffectsModule.forFeature([ RogerthatEffects ]),
    StoreModule.forFeature('rogerthat', rogerthatReducer),
  ],
  exports: [],
  declarations: [],
  providers: [],
})

export class RogerthatModule {
}
