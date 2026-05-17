import { walkDirectory } from './scanner/file-walker';
import { buildGraph } from './scanner/graph-builder';
import { applyGridLayout } from './scanner/layout-engine';
import { calculateHealthScore } from './scanner/health-analyzer';
import { ScanOptions, generateGroups, generateTypeConfig } from './scanner/types';
import { detectProjectStructure, generateClassificationRules } from './scanner/file-classifier';

export async function scanProject(rootPath: string, options: ScanOptions = {}) {
  const exclusions = options.exclusions || [
    'node_modules',
    'vendor',
    'dist',
    'build',
    '.git',
    '.next',
    'coverage',
    '__pycache__',
    'venv',
    'env',
    '.venv',
    'target',
    'out',
  ];

  console.log('🔍 Starting repository scan...');
  console.log(`📁 Root path: ${rootPath}`);
  console.log(`🚫 Exclusions: ${exclusions.join(', ')}`);

  // Phase 1: Discover files
  console.log('📂 Phase 1: Discovering files...');
  const filePaths = await walkDirectory(rootPath, rootPath, exclusions);
  console.log(`✅ Found ${filePaths.length} source files`);

  if (filePaths.length === 0) {
    console.warn('⚠️  No source files found. Check if the repository has supported file types.');
    return {
      nodes: [],
      edges: [],
      healthScore: 0
    };
  }

  // Phase 2: Auto-detect project structure
  console.log('🔎 Phase 2: Detecting project structure...');
  const structure = detectProjectStructure(filePaths);
  console.log('📊 Detected structure:', {
    components: structure.componentDirs.length,
    pages: structure.pageDirs.length,
    hooks: structure.hookDirs.length,
    libs: structure.libDirs.length,
    apis: structure.apiDirs.length,
    services: structure.serviceDirs.length,
    models: structure.modelDirs.length,
    controllers: structure.controllerDirs.length,
  });

  // Phase 3: Generate dynamic classification rules
  console.log('📋 Phase 3: Generating classification rules...');
  const classificationRules = generateClassificationRules(structure);
  console.log(`✅ Generated ${classificationRules.length} classification rules`);

  // Phase 4: Generate dynamic groups
  console.log('📦 Phase 4: Generating groups...');
  const groups = generateGroups(structure);
  console.log(`✅ Generated ${groups.length} groups`);

  // Phase 5: Build graph with dynamic configuration
  console.log('🔗 Phase 5: Building dependency graph...');
  const { nodes, edges } = await buildGraph(filePaths, rootPath, classificationRules, groups);
  console.log(`✅ Created ${nodes.length} nodes and ${edges.length} edges`);

  // Phase 6: Position nodes dynamically
  console.log('📐 Phase 6: Calculating layout...');
  applyGridLayout(nodes);
  console.log('✅ Layout applied');

  // Phase 7: Analyze graph metrics
  console.log('📈 Phase 7: Analyzing health metrics...');
  const healthScore = calculateHealthScore(nodes, edges);
  console.log(`✅ Health score: ${healthScore}/100`);

  console.log('🎉 Scan complete!');

  return {
    nodes,
    edges,
    healthScore,
    structure, // Include structure info for debugging
  };
}
