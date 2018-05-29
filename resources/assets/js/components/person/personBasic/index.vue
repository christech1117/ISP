<template>
  <div>
    <vuestic-tabs class="tabs" :names="['FirstTab', 'SecondTab']">
      <div slot="SecondTab" class="d-flex justify-content-center">
        Second Tab content
      </div>
      <div slot="FirstTab" class="d-flex justify-content-center">
        First Tab content
      </div>
    </vuestic-tabs>
  </div>
</template>

<script>
  export default {
    
  }
</script>

<style scoped>

</style>