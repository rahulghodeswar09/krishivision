/* Crop knowledge base: likely condition per crop and lesion pattern, with prevention steps. */
(function (root) {
  var KB = {
    healthy: { name: 'No visible disease signs', actions: ['Keep scouting your field twice a week, especially after rain.', 'Maintain balanced fertiliser and good drainage.'] },
    sugarcane: {
      spot: { name: 'Brown spot or eye spot', actions: ['Remove and burn heavily spotted lower leaves.', 'Avoid water stress and excess nitrogen.'] },
      blight: { name: 'Leaf scald or blight-type damage', actions: ['Plant disease-free setts and treat them before planting.', 'Remove affected clumps; never use them as seed.'] },
      yellowing: { name: 'Yellow leaf (virus or nutrient-type yellowing)', actions: ['Check drainage and nitrogen or iron shortage first.', 'Control aphids and use healthy planting material.'] },
      rust: { name: 'Sugarcane rust', actions: ['Grow varieties your sugar factory extension team recommends.', 'Keep rows open and weed-free so leaves dry quickly.'] }
    },
    rice: {
      spot: { name: 'Brown spot', actions: ['Use clean seed and balanced nutrition, especially potash.', 'Drain and refill fields to avoid prolonged stress.'] },
      blight: { name: 'Blast or bacterial leaf blight', actions: ['Avoid heavy nitrogen and dense planting.', 'Drain the field and remove infected stubble after harvest.'] },
      yellowing: { name: 'Tungro or nitrogen/zinc yellowing', actions: ['Check for green leafhoppers and remove infected hills.', 'Soil-test before adding zinc or nitrogen.'] },
      rust: { name: 'Rust-like pustules (uncommon in rice)', actions: ['Confirm with a KVK officer before any treatment.', 'Keep field bunds clean of weeds that host pests.'] }
    },
    soybean: {
      spot: { name: 'Frogeye or bacterial leaf spot', actions: ['Rotate with a non-legume crop next season.', 'Avoid working in the field when leaves are wet.'] },
      blight: { name: 'Anthracnose or leaf blight', actions: ['Use certified, treated seed.', 'Space plants for airflow and remove badly affected plants.'] },
      yellowing: { name: 'Yellow Mosaic Virus (spread by whitefly)', actions: ['Uproot infected plants early and remove weed hosts.', 'Use yellow sticky traps and tolerant varieties.'] },
      rust: { name: 'Soybean rust', actions: ['Scout the underside of leaves every few days in humid spells.', 'Contact your KVK quickly; rust spreads fast.'] }
    },
    tomato: {
      spot: { name: 'Early blight (Alternaria)', actions: ['Remove lower infected leaves and stake plants.', 'Water at the base in the morning.'] },
      blight: { name: 'Late blight', actions: ['Remove and destroy infected plants; do not compost them.', 'Avoid overhead watering; act fast in cool, damp weather.'] },
      yellowing: { name: 'Leaf curl virus or yellowing', actions: ['Control whitefly and use insect-proof nursery nets.', 'Uproot infected plants early.'] },
      rust: { name: 'Bacterial or rust-like speckling', actions: ['Avoid handling wet plants.', 'Use clean seedlings and rotate crops.'] }
    }
  };
  KB.severityAdvice = {
    healthy: 'The leaf looks healthy. Keep monitoring.',
    mild: 'Damage is limited. Remove the worst leaves and watch the field for a week.',
    moderate: 'Damage is spreading. Inspect more plants and talk to a local agriculture officer about options.',
    severe: 'Heavy damage. Check the whole field today and contact your KVK or agriculture officer.',
    critical: 'Most of the leaf is affected. Contact your KVK or agriculture officer immediately.'
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = KB; else root.KVKnowledge = KB;
})(typeof window !== 'undefined' ? window : globalThis);
