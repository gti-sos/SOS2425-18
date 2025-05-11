<script>
  import { Button } from'@sveltestrap/sveltestrap';
</script>

<style>
  .center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 80vh;
  }
</style>

<div class="center-container">
  <Button color="primary" href="/integrations/MADC/G13">G13</Button>
  <Button color="primary" href="/integrations/MADC/G14">G14</Button>
  <Button color="primary" href="/integrations/MADC/G20">G20</Button>
  <Button color="primary" href="/integrations/MADC/AidsCastillaLeon">Aids Castilla y León</Button>
  <Button color="primary" href="/integrations/MADC/Weather-RuralHouses">Weather - Rural Houses</Button>
</div>