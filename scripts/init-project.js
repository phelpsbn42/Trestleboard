#!/usr/bin/env node

/**
 * Trestleboard Project Initializer
 *
 * Creates a new project with the standard directory structure
 * and optionally initializes with metadata.
 *
 * Usage:
 *   tb-init <project-name>
 *   tb-init my-awesome-project --description "A great project"
 */

const path = require('path');
const { LocalStorage } = require('./storage');
const { PROJECT_DIRECTORIES } = require('./config');

// Validate project name format
function isValidProjectName(name) {
  return /^[a-z0-9-]+$/.test(name);
}

// Convert project-name to Display Name
function toDisplayName(projectName) {
  return projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Generate project metadata
function createProjectMetadata(projectName, description = '') {
  return {
    project_name: projectName,
    display_name: toDisplayName(projectName),
    description: description,
    created_date: new Date().toISOString().split('T')[0],
    last_modified: new Date().toISOString(),
    status: 'inception',
    team: [],
    tags: [],
    artifacts: {
      inception_deck: {
        completed: false,
        last_updated: null
      },
      specification: {
        use_cases_completed: false,
        c4_diagrams_completed: false,
        wireframes_completed: false,
        adrs_count: 0,
        last_updated: null
      },
      development: {
        task_breakdown_completed: false,
        tasks_total: 0,
        tasks_completed: 0,
        last_updated: null
      }
    },
    contradictions: [],
    notes: ''
  };
}

// Generate project README content
function createProjectReadme(metadata) {
  return `# ${metadata.display_name}

${metadata.description || '*Add project description here*'}

## Status

- **Phase**: Inception
- **Created**: ${metadata.created_date}

## Structure

\`\`\`
${metadata.project_name}/
├── input/                  # User documents + upstream artifacts
├── output/                 # All generated artifacts (flat)
└── project.json            # Project metadata
\`\`\`

## Getting Started

1. **Start with the Analyst persona** to create the Inception Deck
2. **Move to Solution Architect** to create technical specifications
3. **Implement with Paired Developer** using TDD

## Artifacts

| Phase | Status | Last Updated |
|-------|--------|--------------|
| Inception Deck | Not Started | - |
| Specification | Not Started | - |
| Development | Not Started | - |
`;
}

/**
 * Initialize a new project
 * @param {string} projectName - Name of the project
 * @param {object} options - Init options
 * @param {string} options.description - Project description
 * @param {string} options.cwd - Current working directory (defaults to process.cwd())
 * @param {object} storage - Storage provider instance
 * @returns {Promise<object>} Result with projectDir or error
 */
async function initProject(projectName, options = {}, storage = new LocalStorage()) {
  const cwd = options.cwd || process.cwd();
  const projectsDir = path.join(cwd, 'projects');
  const projectDir = path.join(projectsDir, projectName);

  // Check if project already exists
  if (await storage.exists(projectDir)) {
    return { error: `Project already exists: ${projectDir}` };
  }

  // Create directory structure
  for (const dir of PROJECT_DIRECTORIES) {
    const fullPath = path.join(projectDir, dir);
    await storage.mkdir(fullPath);
  }

  // Create project metadata file
  const metadata = createProjectMetadata(projectName, options.description);
  const metadataPath = path.join(projectDir, 'project.json');
  await storage.write(metadataPath, JSON.stringify(metadata, null, 2));

  // Create a README for the project
  const readme = createProjectReadme(metadata);
  const readmePath = path.join(projectDir, 'README.md');
  await storage.write(readmePath, readme);

  // Create .gitkeep files in empty directories
  for (const dir of PROJECT_DIRECTORIES) {
    const gitkeepPath = path.join(projectDir, dir, '.gitkeep');
    await storage.write(gitkeepPath, '');
  }

  return { projectDir, metadata };
}

// Export for testing and external use
module.exports = {
  PROJECT_DIRECTORIES,
  isValidProjectName,
  toDisplayName,
  createProjectMetadata,
  createProjectReadme,
  initProject,
  // Re-export storage for convenience
  LocalStorage,
  StorageProvider: require('./storage').StorageProvider
};

// Only run CLI when executed directly
if (require.main === module) {
  const { program } = require('commander');

  program
    .name('tb-init')
    .description('Initialize a new Trestleboard project')
    .version('1.0.0')
    .argument('<project-name>', 'Name of the project (lowercase, hyphens allowed)')
    .option('-d, --description <text>', 'Project description')
    .option('--no-git', 'Skip git initialization')
    .parse(process.argv);

  const projectName = program.args[0];
  const options = program.opts();

  // Validate project name
  if (!isValidProjectName(projectName)) {
    console.error('Error: Project name must be lowercase with hyphens only');
    process.exit(1);
  }

  const projectDir = path.join(process.cwd(), 'projects', projectName);

  console.log(`Creating project: ${projectName}`);
  console.log(`Location: ${projectDir}`);
  console.log('');

  // Use the initProject function with default LocalStorage
  initProject(projectName, { description: options.description })
    .then(result => {
      if (result.error) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      // Log created items
      for (const dir of PROJECT_DIRECTORIES) {
        console.log(`  Created: ${dir}/`);
      }
      console.log(`  Created: project.json`);
      console.log(`  Created: README.md`);

      console.log('');
      console.log('Project initialized successfully!');
      console.log('');
      console.log('Next steps:');
      console.log(`  1. cd projects/${projectName}`);
      console.log('  2. Add any input documents to input/');
      console.log('  3. Start the Analyst persona:');
      console.log('     claude --system-prompt ../../personas/analyst.md');
      console.log('');
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}
