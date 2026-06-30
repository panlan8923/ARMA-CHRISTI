<script lang="ts">
	import SiteNav from '$lib/components/SiteNav.svelte';
	import ProcessionGrid from '$lib/components/ProcessionGrid.svelte';
	import ProjectImageComposition from '$lib/components/ProjectImageComposition.svelte';
</script>

<svelte:head>
	<title>ARMA CHRISTI — Progetto</title>
</svelte:head>

<main class="progetto-page">
	<ProcessionGrid rows={4} />
	<SiteNav current="progetto" />

	<h1 class="progetto-hero__title">Progetto</h1>

	<div class="progetto-body">
		<div class="progetto-text" lang="it">
			<div class="progetto-text__column">
				<p>
					In antropologia, una processione è un corteo rituale, religioso o profano, che percorre un
					itinerario specifico con un obiettivo preciso, come la propiziazione, l'espiazione o la
					celebrazione.
				</p>
				<p>
					Dal punto di vista antropologico, essa è un rituale collettivo che rafforza l'identità del
					gruppo, esprime la sua relazione con il sacro o con una dimensione extra-quotidiana e
					organizza l'esperienza umana del tempo e dello spazio, spesso rappresentando una forma di
					“rivalsa” di fronte alla limitatezza esistenziale umana.
				</p>
				<p>
					L'integrazione della processione all'interno del progetto rappresenta l'apice dell'azione
					concettuale, un gesto che salda la dimensione fisica del percorso con la sua complessa
					etica sociale e strategica.
				</p>
				<p>
					Il tracciato non è qui solo una linea da mappare, ma una manifestazione rituale che
					sceglie di connettere strategicamente tre avamposti di pensiero critico: un collettivo
					artistico, una libreria indipendente e un progetto editoriale indipendente. Queste realtà,
					pur situate nel cuore storico della città, sono accomunate da una deliberata invisibilità,
					l'assenza di insegne o targhette esterne, che è l'emblema della loro scelta di campo.
				</p>
			</div>
			<div class="progetto-text__column">
				<p>
					Il vero valore aggiunto risiede nel fatto che queste entità non solo evitano i circuiti di
					diffusione convenzionali, ma scelgono programmaticamente le “strade in salita” come
					metafora della loro indipendenza. Optare per percorsi più difficili, meno battuti e meno
					accessibili, è la loro dichiarazione di autonomia e la chiave per mantenere una voce
					autentica su temi sociali cruciali.
				</p>
				<p>La processione, quindi, è la fisicizzazione di questa filosofia di resistenza.</p>
				<p>
					Percorrendo lentamente il tracciato che unisce questi centri, essa celebra e rende
					visibile il valore della difficoltà intenzionale. L'azione rompe l'automatismo urbano e
					costringe l'osservatore a riconoscere che il percorso non è neutro: è un luogo dove la
					vulnerabilità e le storie sconosciute vengono attivamente protette e comunicate.
				</p>
				<p>
					Questo atto genera dati unici sul rapporto tra l'ambiente e la performance, registrati
					anche con l'ausilio della radio, alimenta le componenti critiche del titolo editoriale e
					fornisce il momento culminante per applicare il sistema di identità, trasformando
					l'apparato iconografico e visivo in una potente e indimenticabile narrazione di resistenza
					urbana.
				</p>
			</div>
		</div>

		<section class="progetto-composition" aria-label="Immagini del progetto">
			<ProjectImageComposition />
		</section>
	</div>
</main>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		background: #000000;
		color: #cccccc;
		overflow-x: hidden;
	}

	.progetto-page {
		position: relative;
		box-sizing: border-box;
		font-family: Inter, Arial, sans-serif;
		min-height: 100vh;
		overflow: hidden;
	}

	.progetto-hero__title {
		margin: 0;
		font-weight: 700;
		color: #cccccc;
	}

	.progetto-body {
		box-sizing: border-box;
	}

	.progetto-text {
		display: grid;
		gap: 0 48px;
	}

	.progetto-text__column p {
		margin: 0 0 1em;
		font-size: 16px;
		font-weight: 400;
		line-height: normal;
		text-align: justify;
		color: #cccccc;
		hyphens: auto;
		-webkit-hyphens: auto;
	}

	.progetto-text__column p:last-child {
		margin-bottom: 0;
	}

	.progetto-composition {
		width: 100%;
	}

	@media (max-width: 1279px) {
		.progetto-page {
			width: 100%;
			padding-bottom: 48px;
		}

		.progetto-hero__title {
			position: absolute;
			top: 118px;
			left: 21px;
			right: 21px;
			width: auto;
			max-width: calc(100vw - 42px);
			height: auto;
			font-size: clamp(52px, 16.5vw, 96px);
			line-height: 1.05;
			z-index: 2;
			overflow-wrap: anywhere;
		}

		.progetto-body {
			padding: 220px 21px 0;
		}

		.progetto-text {
			grid-template-columns: 1fr;
		}

		.progetto-composition {
			margin-top: 48px;
		}
	}

	@media (min-width: 1280px) {
		.progetto-page {
			width: 1280px;
			margin: 0 auto;
			padding-bottom: 80px;
		}

		.progetto-hero__title {
			position: absolute;
			top: 118px;
			left: 50px;
			width: 337px;
			height: 250px;
			margin: 0;
			font-size: 96px;
			line-height: 96px;
			z-index: 2;
		}

		.progetto-body {
			padding: 318px 50px 0;
		}

		.progetto-text {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}

		.progetto-composition {
			margin-top: 80px;
		}
	}
</style>
