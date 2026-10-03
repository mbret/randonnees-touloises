import React from 'react'

/**
 * What an editor finds inside the block, which has nothing to fill in: where its
 * list comes from, so nobody goes looking for one to edit. A block has no
 * description of its own in Payload, hence a `ui` field to carry this one.
 */
export const AdminNote: React.FC = () => (
  <p className="field-description">
    Ce bloc se remplit seul : il montre chaque adhérent dont la fiche a un portrait et
    l’autorisation « Portrait » cochée (onglet « Publication »), par ordre alphabétique de prénom.
    Seuls la photo et le prénom sont affichés, jamais le nom.
  </p>
)
