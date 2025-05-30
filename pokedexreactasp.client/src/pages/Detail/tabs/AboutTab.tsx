import React, { useEffect, useState } from 'react';
import { Loading, Text } from '../../../components/ui';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import * as T from '../index.style';
import { RelatedPokemon } from '../../../components/ui';
import { POKEMON_IMAGE } from '../../../config/api.config';
import * as S from './AboutTab.style';
import { pokemonService } from '../../../services';

interface AboutTabProps {
  abilities: Array<{
    ability?: { name: string };
    is_hidden?: boolean;
  }>;
  relatedPokemon: any[];
  specialForms: any[];
  isLoadingRelated: boolean;
  species: any;
  name: string;
  heldItems?: Array<{
    item: { name: string; url: string };
    version_details: Array<{
      rarity: number;
      version: { name: string; url: string };
    }>;
  }>;
}

interface FormSprite {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

const AboutTab: React.FC<AboutTabProps> = ({
  abilities,
  relatedPokemon,
  specialForms,
  isLoadingRelated,
  species,
  name,
  heldItems
}) => {
  const [formSprites, setFormSprites] = useState<Record<string, FormSprite>>({});
  const [isLoadingSprites, setIsLoadingSprites] = useState<boolean>(false);

  useEffect(() => {
    const loadFormSprites = async () => {
      if (specialForms && specialForms.length > 1) {
        setIsLoadingSprites(true);
        const spriteData: Record<string, FormSprite> = {};

        for (const form of specialForms) {
          try {
            // Extract the form ID from the URL
            const formId = form.url.split('/').filter(Boolean).pop();
            if (formId) {
              const formData = await pokemonService.getPokemonForms(formId);
              spriteData[form.name] = formData;
            }
          } catch (error) {
            console.error(`Error loading form sprite for ${form.name}:`, error);
          }
        }

        setFormSprites(spriteData);
        setIsLoadingSprites(false);
      }
    };

    loadFormSprites();
  }, [specialForms]);

  return (
    <>
      {/* Abilities section */}
      <S.AbilitiesContainer>
        <Text as="h3">Abilities</Text>
        <S.AbilitiesGrid>
          {abilities && abilities.map((ability, index) => (
            <S.AbilityCard
              key={index}
              isHidden={ability.is_hidden}
            >
              <S.AbilityName>{ability.ability?.name.replace('-', ' ')}</S.AbilityName>
              {ability.is_hidden && (
                <S.AbilityHiddenLabel>(Hidden)</S.AbilityHiddenLabel>
              )}
            </S.AbilityCard>
          ))}
        </S.AbilitiesGrid>
      </S.AbilitiesContainer>

      {/* Related Pokemon section */}
      {(relatedPokemon.length > 0 || isLoadingRelated) && (
        <S.RelatedPokemonSection>
          {isLoadingRelated ? (
            <T.LoadingWrapper>
            <Loading label="Loading related Pokemon data..." />
          </T.LoadingWrapper>
          ) : (
            <RelatedPokemon
              pokemonList={relatedPokemon}
              title={species && species.generation ?
                `Generation ${species.generation.url.split('/').filter(Boolean).pop()} Pokémon` :
                'Related Pokémon'}
            />
          )}
        </S.RelatedPokemonSection>
      )}

      {/* Special forms section (if available) */}
      {specialForms.length > 1 && (
        <S.FormsContainer>
          <Text as="h3">Forms & Variants</Text>
          <S.FormsGrid>
            {isLoadingSprites ? (
              <T.LoadingWrapper>
              <Loading label="Loading form sprites..." />
            </T.LoadingWrapper>
            ) : (
              specialForms.map((form, index) => (
                <S.FormItem key={index}>
                  <LazyLoadImage
                    src={formSprites[form.name]?.sprites?.front_default ||
                         POKEMON_IMAGE + `${form.url.split('/').filter(Boolean).pop()}.png`}
                    alt={form.name}
                    width={80}
                    height={80}
                    effect="blur"
                  />
                  <S.FormName>
                    {form.name.replace(name, '').replace('-', ' ').trim() || 'Default'}
                  </S.FormName>
                </S.FormItem>
              ))
            )}
          </S.FormsGrid>
        </S.FormsContainer>
      )}

      {/* Held Items section */}
      {heldItems && heldItems.length > 0 && (
        <S.HeldItemsContainer>
          <Text as="h3">Held Items</Text>
          <S.ItemsGrid>
            {heldItems.map((heldItem, index) => (
              <S.ItemCard key={index}>
                <S.ItemName>{heldItem.item.name.replace('-', ' ')}</S.ItemName>
                <S.ItemDetails>
                  {heldItem.version_details.map((detail, idx) => (
                    <S.ItemDetail key={idx}>
                      {detail.version.name}: {detail.rarity}%
                    </S.ItemDetail>
                  ))}
                </S.ItemDetails>
              </S.ItemCard>
            ))}
          </S.ItemsGrid>
        </S.HeldItemsContainer>
      )}
    </>
  );
};

export default AboutTab;
