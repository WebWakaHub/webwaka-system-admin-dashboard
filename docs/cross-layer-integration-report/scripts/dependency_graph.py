#!/usr/bin/env python3
"""
WebWaka Cross-Layer Dependency Graph & Build Order Analysis
============================================================
Analyzes the biological hierarchy to determine:
1. Layer-level dependency ordering
2. Intra-layer parallelism potential
3. Build sequencing for deployment
4. Critical path analysis
"""

import json

# Layer hierarchy (bottom-up dependency order)
LAYERS = [
    {
        "name": "Organelle",
        "level": 0,
        "count": 22,
        "depends_on": [],
        "pattern": "Standalone executors",
        "deploy_unit": "npm package",
        "parallelism": "Full — all 22 organelles are independent",
    },
    {
        "name": "Cell",
        "level": 1,
        "count": 16,
        "depends_on": ["Organelle"],
        "pattern": "Compose 1-3 organelles each",
        "deploy_unit": "npm package",
        "parallelism": "Full — all 16 cells are independent after organelles built",
    },
    {
        "name": "Tissue",
        "level": 2,
        "count": 10,
        "depends_on": ["Cell"],
        "pattern": "Coordinate 2-4 cells each",
        "deploy_unit": "npm package",
        "parallelism": "Full — all 10 tissues are independent after cells built",
    },
    {
        "name": "Organ",
        "level": 3,
        "count": 56,
        "depends_on": ["Tissue"],
        "pattern": "Coordinate 2-5 tissues each",
        "deploy_unit": "Deployable service",
        "parallelism": "Full — all 56 organs are independent after tissues built",
    },
    {
        "name": "System",
        "level": 4,
        "count": 19,
        "depends_on": ["Organ"],
        "pattern": "Coordinate 3-8 organs each",
        "deploy_unit": "Service group / namespace",
        "parallelism": "Full — all 19 systems are independent after organs built",
    },
    {
        "name": "Organism",
        "level": 5,
        "count": 1,
        "depends_on": ["System"],
        "pattern": "Orchestrate all 19 systems",
        "deploy_unit": "Platform orchestrator",
        "parallelism": "Sequential — single organism depends on all systems",
    },
]

# System-to-organ mapping (19 systems)
SYSTEMS = {
    "AI Cognitive Fabric": {"organs": 3, "domain": "ai"},
    "Analytics Platform": {"organs": 3, "domain": "ana"},
    "Config Platform": {"organs": 3, "domain": "cfg"},
    "E-Commerce": {"organs": 4, "domain": "com"},
    "Learning Platform": {"organs": 3, "domain": "edu"},
    "Enterprise Platform": {"organs": 3, "domain": "ent"},
    "Marketplace Platform": {"organs": 3, "domain": "ext"},
    "Banking": {"organs": 3, "domain": "fin-banking"},
    "Investment": {"organs": 3, "domain": "fin-investment"},
    "Location Platform": {"organs": 3, "domain": "geo"},
    "Civic Platform": {"organs": 3, "domain": "gov"},
    "Health Platform": {"organs": 3, "domain": "hlt"},
    "Identity Platform": {"organs": 3, "domain": "ida"},
    "Cloud Platform": {"organs": 3, "domain": "inf"},
    "Logistics Platform": {"organs": 3, "domain": "log"},
    "Content Platform": {"organs": 3, "domain": "med"},
    "Asset Platform": {"organs": 3, "domain": "res"},
    "Security Platform": {"organs": 3, "domain": "sec"},
    "Social Platform": {"organs": 2, "domain": "soc"},
}

print("=" * 70)
print("WEBWAKA DEPENDENCY GRAPH & BUILD ORDER ANALYSIS")
print("=" * 70)

print("\n## 1. Layer Dependency Chain (Bottom-Up)")
print("-" * 50)
for layer in LAYERS:
    deps = " → ".join(layer["depends_on"]) if layer["depends_on"] else "NONE (foundation)"
    print(f"  L{layer['level']}: {layer['name']} ({layer['count']} components)")
    print(f"       Depends on: {deps}")
    print(f"       Parallelism: {layer['parallelism']}")
    print(f"       Deploy unit: {layer['deploy_unit']}")
    print()

print("\n## 2. Build Order (6 sequential waves)")
print("-" * 50)
total_parallel = 0
for layer in LAYERS:
    total_parallel += layer["count"]
    print(f"  Wave {layer['level']+1}: Build all {layer['count']} {layer['name']}s in parallel")
    print(f"         Cumulative: {total_parallel}/124 components")

print("\n## 3. Critical Path Analysis")
print("-" * 50)
# Assuming ~2 min per component build, all parallel within wave
for layer in LAYERS:
    est_time = "~2 min" if layer["count"] <= 5 else "~3 min (parallel)" if layer["count"] <= 20 else "~5 min (parallel, 56 components)"
    print(f"  Wave {layer['level']+1} ({layer['name']}): {est_time}")
print(f"  TOTAL CRITICAL PATH: ~17 min (6 sequential waves, max parallelism)")

print("\n## 4. Deployment Grouping Strategy")
print("-" * 50)
print("  Group A (Foundation Libraries): Organelle + Cell + Tissue = 48 packages")
print("    → Published to private npm registry")
print("    → No runtime deployment needed")
print()
print("  Group B (Deployable Services): Organ = 56 services")
print("    → Each organ becomes a microservice or serverless function")
print("    → Deployed to container orchestrator")
print()
print("  Group C (Service Mesh): System = 19 service groups")
print("    → Each system is a namespace/service group")
print("    → Manages routing between its organs")
print()
print("  Group D (Platform Orchestrator): Organism = 1 orchestrator")
print("    → Single deployment: API gateway + event bus + governance")
print("    → Deployed last, depends on all systems")

print("\n## 5. System Domain Breakdown")
print("-" * 50)
for name, info in SYSTEMS.items():
    print(f"  {name}: {info['organs']} organs (domain: {info['domain']})")

# Save analysis
analysis = {
    "layers": LAYERS,
    "systems": SYSTEMS,
    "build_waves": 6,
    "total_components": 124,
    "critical_path_minutes": 17,
    "deployment_groups": {
        "A_foundation": {"layers": ["Organelle", "Cell", "Tissue"], "count": 48, "type": "npm packages"},
        "B_services": {"layers": ["Organ"], "count": 56, "type": "microservices"},
        "C_mesh": {"layers": ["System"], "count": 19, "type": "service groups"},
        "D_orchestrator": {"layers": ["Organism"], "count": 1, "type": "platform orchestrator"},
    }
}

with open("/home/ubuntu/dependency_analysis.json", "w") as f:
    json.dump(analysis, f, indent=2, default=str)

print(f"\n{'='*70}")
print("Analysis saved to dependency_analysis.json")
print(f"{'='*70}")
